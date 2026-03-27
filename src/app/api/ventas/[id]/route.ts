export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const sale = await prisma.venta.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { product: true } },
    },
  })

  if (!sale) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(sale)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await request.json()

  const sale = await prisma.venta.update({ where: { id }, data: { status } })
  return NextResponse.json(sale)
}
