export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.producto.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      stockMovements: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  })

  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const product = await prisma.producto.update({
    where: { id },
    data: {
      name: body.name,
      code: body.code || null,
      categoryId: body.categoryId,
      brandId: body.brandId || null,
      buyPrice: body.buyPrice,
      sellPrice: body.sellPrice,
      minStock: body.minStock,
      unit: body.unit,
    },
    include: { category: true, brand: true },
  })

  return NextResponse.json(product)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.producto.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
