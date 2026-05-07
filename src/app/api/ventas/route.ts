export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { resolveOrCreateTurno } from "@/lib/turno"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") ?? ""
  const clientId = searchParams.get("clientId") ?? ""

  const today = new Date()
  const defaultStart = new Date(today.setHours(0, 0, 0, 0))
  const defaultEnd = new Date(today.setHours(23, 59, 59, 999))

  const sales = await prisma.venta.findMany({
    where: {
      ...(date
        ? {
            createdAt: {
              gte: new Date(`${date}T00:00:00`),
              lte: new Date(`${date}T23:59:59`),
            },
          }
        : {
            createdAt: { gte: defaultStart, lte: defaultEnd },
          }),
      ...(clientId && { clientId }),
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(sales)
}

class StockGuardError extends Error {
  constructor(msg: string) { super(msg); this.name = "StockGuardError" }
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  for (const item of body.items as { productId: string; quantity: number; price: number }[]) {
    if (!item.quantity || item.quantity < 1)
      return NextResponse.json({ error: "La cantidad debe ser al menos 1" }, { status: 400 })

    const product = await prisma.producto.findUnique({
      where: { id: item.productId },
      select: { stock: true, name: true, active: true },
    })
    if (!product || !product.active)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    if (product.stock - item.quantity < 1)
      return NextResponse.json(
        { error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}` },
        { status: 422 }
      )
  }

  const total =
    body.items.reduce(
      (acc: number, item: { quantity: number; price: number }) =>
        acc + item.quantity * item.price,
      0
    ) - (body.discount ?? 0)

  let sale
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sale = await prisma.$transaction(async (tx: any) => {
      const turnoId = await resolveOrCreateTurno(tx)

      const v = await tx.venta.create({
        data: {
          clientId: body.clientId || null,
          total,
          discount: body.discount ?? 0,
          status: "completed",
          turnoId,
          items: {
            create: body.items.map((item: { productId: string; quantity: number; price: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })

      for (const item of body.items) {
        const updated = await tx.producto.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
          select: { stock: true, name: true },
        })
        if (updated.stock < 1)
          throw new StockGuardError(`Stock insuficiente para "${updated.name}"`)
        await tx.movimientoStock.create({
          data: {
            productId: item.productId,
            type: "exit",
            quantity: item.quantity,
            reason: `Venta #${v.id.slice(-6)}`,
          },
        })
      }

      return v
    })
  } catch (e) {
    if (e instanceof StockGuardError)
      return NextResponse.json({ error: e.message }, { status: 422 })
    throw e
  }

  // Prisma serializes Decimal fields (e.g. `total`) as strings in JSON — callers must parse them
  return NextResponse.json(sale, { status: 201 })
}
