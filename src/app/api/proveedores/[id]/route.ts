export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supplier = await prisma.proveedor.findUnique({
    where: { id },
    include: {
      productLinks: { include: { product: { include: { category: true } } } },
      purchases: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  })

  if (!supplier) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(supplier)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const supplier = await prisma.proveedor.update({
    where: { id },
    data: {
      name: body.name,
      contactName: body.contactName || null,
      phone: body.phone || null,
      email: body.email || null,
    },
  })
  return NextResponse.json(supplier)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.proveedor.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
