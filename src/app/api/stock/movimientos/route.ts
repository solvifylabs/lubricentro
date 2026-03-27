export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const body = await request.json()
  // body: { productId, type: "entry"|"exit"|"adjustment", quantity, reason }

  const product = await prisma.producto.findUnique({ where: { id: body.productId } })
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })

  const delta = body.type === "exit" ? -Math.abs(body.quantity) : Math.abs(body.quantity)

  const [movement] = await prisma.$transaction([
    prisma.movimientoStock.create({
      data: {
        productId: body.productId,
        type: body.type,
        quantity: body.quantity,
        reason: body.reason ?? null,
      },
    }),
    prisma.producto.update({
      where: { id: body.productId },
      data: { stock: { increment: delta } },
    }),
  ])

  return NextResponse.json(movement, { status: 201 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get("productId")

  const movements = await prisma.movimientoStock.findMany({
    where: productId ? { productId } : undefined,
    include: { product: { select: { name: true, code: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(movements)
}
