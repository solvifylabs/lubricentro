export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const brands = await prisma.marca.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(brands)
}

export async function POST(request: NextRequest) {
  const { name } = await request.json()
  const brand = await prisma.marca.create({ data: { name } })
  return NextResponse.json(brand, { status: 201 })
}
