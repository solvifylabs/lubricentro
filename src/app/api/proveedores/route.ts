export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const suppliers = await prisma.proveedor.findMany({
    where: { active: true },
    include: {
      _count: { select: { purchases: true, productLinks: true } },
    },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(suppliers)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const supplier = await prisma.proveedor.create({
    data: {
      name: body.name,
      contactName: body.contactName || null,
      phone: body.phone || null,
      email: body.email || null,
    },
  })
  return NextResponse.json(supplier, { status: 201 })
}
