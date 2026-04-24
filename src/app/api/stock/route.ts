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

  const product = await prisma.producto.create({
    data: {
      name: body.name,
      code: body.code || null,
      categoryId: body.categoryId,
      brandId: body.brandId || null,
      buyPrice: body.buyPrice,
      sellPrice: body.sellPrice,
      stock: body.stock ?? 0,
      minStock: body.minStock ?? 5,
      unit: body.unit ?? "unidad",
      expectedConsumptionPerWash: body.expectedConsumptionPerWash ?? null,
    },
    include: { category: true, brand: true },
  })

  // Record initial stock movement if stock > 0
  if (body.stock > 0) {
    await prisma.movimientoStock.create({
      data: {
        productId: product.id,
        type: "entry",
        quantity: body.stock,
        reason: "Stock inicial",
      },
    })
  }

  return NextResponse.json(product, { status: 201 })
}
