import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { POST } from "@/app/api/servicios/route"
import {
  cleanDatabase,
  createCategoria,
  createProducto,
  createCliente,
  createVehiculo,
} from "@/tests/setup/helpers"

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe("POST /api/servicios", () => {
  it("creates a servicio without products, no stock affected", async () => {
    const cliente = await createCliente()
    const vehiculo = await createVehiculo(cliente.id)

    const req = new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: vehiculo.id,
        mileage: 45000,
        nextServiceKm: 50000,
        amount: 5000,
        products: [],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body.id).toBeDefined()

    const movements = await prisma.movimientoStock.findMany()
    expect(movements).toHaveLength(0)
  })

  it("decrements stock and creates MovimientoStock for each product used", async () => {
    const cat = await createCategoria()
    const prod1 = await createProducto(cat.id, { stock: 10 })
    const prod2 = await createProducto(cat.id, { stock: 8 })
    const cliente = await createCliente()
    const vehiculo = await createVehiculo(cliente.id)

    const req = new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: vehiculo.id,
        mileage: 30000,
        amount: 8000,
        products: [
          { productId: prod1.id, quantity: 3, price: 150 },
          { productId: prod2.id, quantity: 1, price: 200 },
        ],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const [p1, p2] = await Promise.all([
      prisma.producto.findUnique({ where: { id: prod1.id } }),
      prisma.producto.findUnique({ where: { id: prod2.id } }),
    ])
    expect(p1!.stock).toBe(7)
    expect(p2!.stock).toBe(7)

    const movements = await prisma.movimientoStock.findMany({
      where: { type: "exit" },
    })
    expect(movements).toHaveLength(2)
    expect(movements.map((m) => m.quantity).sort()).toEqual([1, 3])
  })

  it("creates a servicio without a vehicle (anonymous)", async () => {
    const req = new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 3000,
        products: [],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body.vehicleId).toBeNull()
  })
})
