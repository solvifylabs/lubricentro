export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { resolveOrCreateTurno } from "@/lib/turno"

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") ?? ""
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const skip = (page - 1) * PAGE_SIZE

  const dateFilter = date
    ? {
        sessionDate: {
          gte: new Date(`${date}T00:00:00`),
          lte: new Date(`${date}T23:59:59`),
        },
      }
    : {}

  const [sessions, total] = await Promise.all([
    prisma.sesionLavaAuto.findMany({
      where: dateFilter,
      include: {
        products: { include: { product: true } },
        turno: true,
      },
      orderBy: { sessionDate: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.sesionLavaAuto.count({ where: dateFilter }),
  ])

  return NextResponse.json({ sessions, total, page, pageSize: PAGE_SIZE })
}

class StockGuardError extends Error {
  constructor(msg: string) { super(msg); this.name = "StockGuardError" }
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.vehicleId) {
    const vehicle = await prisma.vehiculo.findUnique({ where: { id: body.vehicleId }, select: { id: true } })
    if (!vehicle) return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 })
  }

  if (body.products?.length > 0) {
    for (const item of body.products as { productId: string; quantity: number }[]) {
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
  }

  let session
  try {
    session = await prisma.$transaction(async (tx) => {
      const turnoId = await resolveOrCreateTurno(tx)

      const ses = await tx.sesionLavaAuto.create({
        data: {
          plate: body.plate || null,
          vehicleId: body.vehicleId || null,
          washType: body.washType || "integro",
          amount: body.amount,
          notes: body.notes || null,
          sessionDate: body.sessionDate ? new Date(body.sessionDate) : new Date(),
          turnoId,
        },
      })

      if (body.products && body.products.length > 0) {
        for (const item of body.products as { productId: string; quantity: number }[]) {
          await tx.sesionProducto.create({
            data: { sessionId: ses.id, productId: item.productId, quantity: item.quantity },
          })
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
              reason: `Lavado #${ses.id.slice(-6)}`,
            },
          })
        }
      }

      return ses
    })
  } catch (e) {
    if (e instanceof StockGuardError)
      return NextResponse.json({ error: e.message }, { status: 422 })
    throw e
  }

  return NextResponse.json(session, { status: 201 })
}
