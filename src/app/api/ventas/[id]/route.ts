export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const sale = await prisma.venta.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { product: true } },
    },
  })

  if (!sale) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(sale)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await request.json()

  const current = await prisma.venta.findUnique({ where: { id }, select: { status: true } })
  if (!current) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (current.status === "cancelled")
    return NextResponse.json({ error: "La venta ya está cancelada" }, { status: 409 })

  const sale = await prisma.$transaction(async (tx) => {
    const updated = await tx.venta.update({ where: { id }, data: { status } })

    if (status === "cancelled") {
      const items = await tx.detalleVenta.findMany({ where: { saleId: id } })
      for (const item of items) {
        await tx.producto.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
        await tx.movimientoStock.create({
          data: {
            productId: item.productId,
            type: "entry",
            quantity: item.quantity,
            reason: `Cancelación Venta #${id.slice(-6)}`,
          },
        })
      }
    }

    return updated
  })

  return NextResponse.json(sale)
}
