export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const vehicle = await prisma.vehiculo.findUnique({
    where: { id },
    include: {
      client: true,
      services: {
        include: { products: { include: { product: true } } },
        orderBy: { serviceDate: "desc" },
      },
    },
  })

  if (!vehicle) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(vehicle)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const vehicle = await prisma.vehiculo.update({
    where: { id },
    data: {
      plate: body.plate.toUpperCase(),
      brand: body.brand,
      model: body.model,
      year: body.year ? Number(body.year) : null,
      engine: body.engine || null,
      clientId: body.clientId || null,
    },
  })

  return NextResponse.json(vehicle)
}
