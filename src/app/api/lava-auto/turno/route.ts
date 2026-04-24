export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET() {
  const turno = await prisma.turnoLavaAuto.findUnique({
    where: { date: today() },
    include: { _count: { select: { sessions: true } } },
  })

  // Return only if active (endedAt is null) — widget shows null as "no active turn"
  if (!turno || turno.endedAt !== null) return NextResponse.json(null)

  return NextResponse.json(turno)
}

export async function POST() {
  const todayDate = today()
  const existing = await prisma.turnoLavaAuto.findUnique({ where: { date: todayDate } })

  if (!existing) {
    const turno = await prisma.turnoLavaAuto.create({
      data: { date: todayDate, startedAt: new Date() },
    })
    return NextResponse.json(turno, { status: 201 })
  }

  if (existing.endedAt === null) {
    return NextResponse.json(existing)
  }

  // Reopen closed turno
  const reopened = await prisma.turnoLavaAuto.update({
    where: { id: existing.id },
    data: { endedAt: null },
  })
  return NextResponse.json(reopened)
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
