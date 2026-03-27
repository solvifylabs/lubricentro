export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const client = await prisma.cliente.findUnique({
    where: { id },
    include: {
      vehicles: { include: { services: { orderBy: { serviceDate: "desc" }, take: 5 } } },
      services: {
        include: { vehicle: true },
        orderBy: { serviceDate: "desc" },
        take: 10,
      },
      sales: {
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!client) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(client)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const client = await prisma.cliente.update({
    where: { id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName || null,
      phone: body.phone || null,
      email: body.email || null,
      dni: body.dni || null,
    },
  })

  return NextResponse.json(client)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.cliente.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}
