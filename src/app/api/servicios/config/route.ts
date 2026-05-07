export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const config = await prisma.configServicio.findFirst()

  if (!config) {
    const created = await prisma.configServicio.create({
      data: { servicePrice: 0 },
    })
    return NextResponse.json(created)
  }

  return NextResponse.json(config)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const existing = await prisma.configServicio.findFirst()

  if (!existing) {
    const created = await prisma.configServicio.create({
      data: { servicePrice: body.servicePrice ?? 0 },
    })
    return NextResponse.json(created)
  }

  const updated = await prisma.configServicio.update({
    where: { id: existing.id },
    data: { servicePrice: body.servicePrice },
  })

  return NextResponse.json(updated)
}
