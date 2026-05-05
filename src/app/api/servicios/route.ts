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

class StockGuardError extends Error {
  constructor(msg: string) { super(msg); this.name = "StockGuardError" }
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.vehicleId) {
    const vehicle = await prisma.vehiculo.findUnique({ where: { id: body.vehicleId }, select: { id: true } })
    if (!vehicle) return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 })
  }

  if (body.products?.length > 0) {
    for (const item of body.products as { productId: string; quantity: number }[]) {
      if (!item.quantity || item.quantity < 1)
        return NextResponse.json({ error: "La cantidad debe ser al menos 1" }, { status: 400 })

      const product = await prisma.producto.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true, active: true },
      })
      if (!product || !product.active)
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
      if (product.stock - item.quantity < 1)
        return NextResponse.json(
          { error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}` },
          { status: 422 }
        )
    }
  }

  let service
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = await prisma.$transaction(async (tx: any) => {
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
          const updated = await tx.producto.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
            select: { stock: true, name: true },
          })
          if (updated.stock < 1)
            throw new StockGuardError(`Stock insuficiente para "${updated.name}"`)
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
  } catch (e) {
    if (e instanceof StockGuardError)
      return NextResponse.json({ error: e.message }, { status: 422 })
    throw e
  }

  return NextResponse.json(service, { status: 201 })
}
