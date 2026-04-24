export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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

export async function POST(request: NextRequest) {
  const body = await request.json()

  const session = await prisma.$transaction(async (tx) => {
    const ses = await tx.sesionLavaAuto.create({
      data: {
        plate: body.plate || null,
        amount: body.amount,
        notes: body.notes || null,
        sessionDate: body.sessionDate ? new Date(body.sessionDate) : new Date(),
        turnoId: body.turnoId || null,
      },
    })

    if (body.products && body.products.length > 0) {
      for (const item of body.products as { productId: string; quantity: number }[]) {
        await tx.sesionProducto.create({
          data: {
            sessionId: ses.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        })
        await tx.producto.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
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

  return NextResponse.json(session, { status: 201 })
}
