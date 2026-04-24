export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") ?? ""
  const clientId = searchParams.get("clientId") ?? ""

  const vehicles = await prisma.vehiculo.findMany({
    where: {
      ...(search && {
        OR: [
          { plate: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(clientId && { clientId }),
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { services: true } },
    },
    orderBy: { plate: "asc" },
  })

  return NextResponse.json(vehicles)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.year || !body.engine || !body.clientId) {
    return NextResponse.json(
      { error: "Año, motor y cliente son requeridos" },
      { status: 400 }
    )
  }

  const vehicle = await prisma.vehiculo.create({
    data: {
      plate: body.plate.toUpperCase(),
      brand: body.brand,
      model: body.model,
      year: Number(body.year),
      engine: body.engine,
      clientId: body.clientId,
    },
    include: { client: true },
  })

  return NextResponse.json(vehicle, { status: 201 })
}
