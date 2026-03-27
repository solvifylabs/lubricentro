export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const categories = await prisma.categoria.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const { name } = await request.json()
  const category = await prisma.categoria.create({ data: { name } })
  return NextResponse.json(category, { status: 201 })
}
