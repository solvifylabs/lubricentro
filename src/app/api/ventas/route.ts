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

export async function POST(request: NextRequest) {
  const body = await request.json()

  const total =
    body.items.reduce(
      (acc: number, item: { quantity: number; price: number }) =>
        acc + item.quantity * item.price,
      0
    ) - (body.discount ?? 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sale = await prisma.$transaction(async (tx: any) => {
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
      await tx.producto.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
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

  return NextResponse.json(sale, { status: 201 })
}
