export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") ?? ""
  const categoryId = searchParams.get("categoryId") ?? ""
  const lowStock = searchParams.get("lowStock") === "true"

  const products = await prisma.producto.findMany({
    where: {
      active: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(lowStock && { stock: { lte: prisma.producto.fields.minStock } }),
    },
    include: { category: true, brand: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.categoryId)
    return NextResponse.json({ error: "Categoría requerida" }, { status: 400 })
  if (!body.brandId)
    return NextResponse.json({ error: "Marca requerida" }, { status: 400 })
  if (!body.minStock || body.minStock < 1)
    return NextResponse.json({ error: "Stock mínimo debe ser al menos 1" }, { status: 400 })
  if (!body.stock || body.stock < 1)
    return NextResponse.json({ error: "El stock inicial debe ser mayor a 0" }, { status: 400 })

  const product = await prisma.producto.create({
    data: {
      name: body.name,
      code: body.code || null,
      categoryId: body.categoryId,
      brandId: body.brandId,
      buyPrice: body.buyPrice,
      sellPrice: body.sellPrice,
      stock: body.stock,
      minStock: body.minStock,
      unit: body.unit ?? "unidad",
      expectedConsumptionPerWash: body.expectedConsumptionPerWash ?? null,
    },
    include: { category: true, brand: true },
  })

  await prisma.movimientoStock.create({
    data: {
      productId: product.id,
      type: "entry",
      quantity: body.stock,
      reason: "Stock inicial",
    },
  })

  return NextResponse.json(product, { status: 201 })
}
