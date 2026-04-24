export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const config = await prisma.configLavaAuto.findFirst()

  if (!config) {
    const created = await prisma.configLavaAuto.create({
      data: { washPrice: 0 },
    })
    return NextResponse.json(created)
  }

  return NextResponse.json(config)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const existing = await prisma.configLavaAuto.findFirst()

  if (!existing) {
    const created = await prisma.configLavaAuto.create({
      data: { washPrice: body.washPrice },
    })
    return NextResponse.json(created)
  }

  const updated = await prisma.configLavaAuto.update({
    where: { id: existing.id },
    data: { washPrice: body.washPrice },
  })

  return NextResponse.json(updated)
}
