import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { GET, POST } from "@/app/api/servicios/route"
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

  it("returns 400 when a product has quantity 0", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 5 })

    const req = new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 5000,
        products: [{ productId: prod.id, quantity: 0, price: 100 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/cantidad/i)
  })

  it("returns 404 when using a soft-deleted (inactive) product", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 5, active: false })

    const req = new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 5000,
        products: [{ productId: prod.id, quantity: 1, price: 100 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it("returns 422 when product usage would bring stock to 0", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 3 })
    const cliente = await createCliente()
    const vehiculo = await createVehiculo(cliente.id)

    const req = new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: vehiculo.id,
        amount: 5000,
        products: [{ productId: prod.id, quantity: 3, price: 150 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toMatch(/stock insuficiente/i)
  })

  it("returns 422 when product usage would bring stock below 0", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 2 })

    const req = new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 5000,
        products: [{ productId: prod.id, quantity: 10, price: 150 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(422)
  })

  it("allows service that leaves exactly 1 unit in stock", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 4 })

    const req = new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 5000,
        products: [{ productId: prod.id, quantity: 3, price: 150 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const updated = await prisma.producto.findUnique({ where: { id: prod.id } })
    expect(updated!.stock).toBe(1)
  })

  it("returns 404 when vehicleId does not exist", async () => {
    const req = new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: "non-existent-id", amount: 5000, products: [] }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
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

// ─── GET /api/servicios ───────────────────────────────────────────────────────

describe("GET /api/servicios", () => {
  it("returns empty array when no services exist", async () => {
    const res = await GET(new NextRequest("http://localhost/api/servicios"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it("returns services with nested vehicle and client", async () => {
    const cliente = await createCliente()
    const vehiculo = await createVehiculo(cliente.id)

    await POST(new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: vehiculo.id, mileage: 30000, amount: 5000, products: [] }),
    }))

    const res = await GET(new NextRequest("http://localhost/api/servicios"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.length).toBeGreaterThan(0)
    expect(body[0].vehicle).toBeDefined()
    expect(body[0].vehicle.client.id).toBe(cliente.id)
  })

  it("filters by plate search term", async () => {
    const cliente = await createCliente()
    const v1 = await createVehiculo(cliente.id)
    const v2 = await createVehiculo(cliente.id)

    await POST(new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: v1.id, amount: 1000, products: [] }),
    }))
    await POST(new NextRequest("http://localhost/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: v2.id, amount: 2000, products: [] }),
    }))

    const res = await GET(new NextRequest(`http://localhost/api/servicios?search=${v1.plate}`))
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].vehicle.plate).toBe(v1.plate)
  })
})
