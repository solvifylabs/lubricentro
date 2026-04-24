export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { resolveOrCreateTurno } from "@/lib/turno"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") ?? ""
  const date = searchParams.get("date") ?? ""

  const services = await prisma.servicio.findMany({
    where: {
      ...(search && {
        OR: [
          { vehicle: { plate: { contains: search, mode: "insensitive" } } },
          { vehicle: { client: { firstName: { contains: search, mode: "insensitive" } } } },
          { vehicle: { client: { lastName: { contains: search, mode: "insensitive" } } } },
        ],
      }),
      ...(date && {
        serviceDate: {
          gte: new Date(`${date}T00:00:00`),
          lte: new Date(`${date}T23:59:59`),
        },
      }),
    },
    include: {
      vehicle: {
        include: {
          client: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
      },
    },
    orderBy: { serviceDate: "desc" },
    take: 50,
  })

  return NextResponse.json(services)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = await prisma.$transaction(async (tx: any) => {
    const turnoId = await resolveOrCreateTurno(tx)

    const svc = await tx.servicio.create({
      data: {
        vehicleId: body.vehicleId || null,
        mileage: body.mileage ? Number(body.mileage) : null,
        nextServiceKm: body.nextServiceKm ? Number(body.nextServiceKm) : null,
        serviceDate: body.serviceDate ? new Date(body.serviceDate) : new Date(),
        nextServiceDate: body.nextServiceDate ? new Date(body.nextServiceDate) : null,
        amount: body.amount,
        notes: body.notes || null,
        turnoId,
      },
    })

    if (body.products && body.products.length > 0) {
      for (const item of body.products) {
        await tx.servicioProducto.create({
          data: {
            serviceId: svc.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        })
        await tx.producto.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
        await tx.movimientoStock.create({
          data: {
            productId: item.productId,
            type: "exit",
            quantity: item.quantity,
            reason: `Servicio #${svc.id.slice(-6)}`,
          },
        })
      }
    }

    return svc
  })

  return NextResponse.json(service, { status: 201 })
}
