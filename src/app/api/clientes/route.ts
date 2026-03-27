export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") ?? ""

  const clients = await prisma.cliente.findMany({
    where: {
      active: true,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { dni: { contains: search } },
        ],
      }),
    },
    include: {
      vehicles: { select: { id: true, plate: true, brand: true, model: true } },
      _count: { select: { services: true, sales: true } },
    },
    orderBy: { firstName: "asc" },
  })

  return NextResponse.json(clients)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const client = await prisma.cliente.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName || null,
      phone: body.phone || null,
      email: body.email || null,
      dni: body.dni || null,
    },
  })

  return NextResponse.json(client, { status: 201 })
}
