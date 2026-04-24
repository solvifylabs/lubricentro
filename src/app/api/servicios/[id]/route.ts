export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const service = await prisma.servicio.findUnique({
    where: { id },
    include: {
      vehicle: { include: { client: true } },
      products: { include: { product: { include: { brand: true } } } },
    },
  })

  if (!service) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(service)
}
