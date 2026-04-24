export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const config = await prisma.configLavaAuto.findFirst()

  if (!config) {
    const created = await prisma.configLavaAuto.create({
      data: { priceInterior: 0, priceExterior: 0, priceIntegro: 0 },
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
      data: {
        priceInterior: body.priceInterior ?? 0,
        priceExterior: body.priceExterior ?? 0,
        priceIntegro: body.priceIntegro ?? 0,
      },
    })
    return NextResponse.json(created)
  }

  const updated = await prisma.configLavaAuto.update({
    where: { id: existing.id },
    data: {
      priceInterior: body.priceInterior ?? existing.priceInterior,
      priceExterior: body.priceExterior ?? existing.priceExterior,
      priceIntegro: body.priceIntegro ?? existing.priceIntegro,
    },
  })

  return NextResponse.json(updated)
}
