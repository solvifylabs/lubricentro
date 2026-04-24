export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function todayEnd() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

export async function GET() {
  const turno = await prisma.turnoLavaAuto.findFirst({
    where: {
      endedAt: null,
      startedAt: { gte: todayStart(), lte: todayEnd() },
    },
    include: {
      _count: { select: { sessions: true } },
    },
    orderBy: { startedAt: "desc" },
  })

  return NextResponse.json(turno)
}

export async function POST() {
  const existing = await prisma.turnoLavaAuto.findFirst({
    where: {
      endedAt: null,
      startedAt: { gte: todayStart(), lte: todayEnd() },
    },
  })

  if (existing) {
    return NextResponse.json({ error: "Ya hay un turno activo" }, { status: 409 })
  }

  const turno = await prisma.turnoLavaAuto.create({
    data: {
      date: todayStart(),
      startedAt: new Date(),
    },
  })

  return NextResponse.json(turno, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id } = body

  const turno = await prisma.turnoLavaAuto.update({
    where: { id },
    data: { endedAt: new Date() },
  })

  return NextResponse.json(turno)
}
