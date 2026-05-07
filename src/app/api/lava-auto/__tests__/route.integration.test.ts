import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { GET, POST } from "@/app/api/lava-auto/route"
import { cleanDatabase, createCategoria, createProducto, createCliente, createVehiculo } from "@/tests/setup/helpers"

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe("POST /api/lava-auto", () => {
  it("creates a wash session without products", async () => {
    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "ABC123",
        washType: "integro",
        amount: 2500,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body.plate).toBe("ABC123")
    expect(body.washType).toBe("integro")

    const movements = await prisma.movimientoStock.findMany()
    expect(movements).toHaveLength(0)
  })

  it("decrements stock and creates MovimientoStock per product consumed", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 20 })

    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "XYZ789",
        washType: "exterior",
        amount: 1500,
        products: [{ productId: prod.id, quantity: 2 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const updated = await prisma.producto.findUnique({ where: { id: prod.id } })
    expect(updated!.stock).toBe(18)

    const movement = await prisma.movimientoStock.findFirst({
      where: { productId: prod.id },
    })
    expect(movement).not.toBeNull()
    expect(movement!.type).toBe("exit")
    expect(movement!.quantity).toBe(2)
  })

  it("returns 400 when a product has quantity 0", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 5 })

    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "DDD444",
        washType: "integro",
        amount: 2000,
        products: [{ productId: prod.id, quantity: 0 }],
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

    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "EEE555",
        washType: "exterior",
        amount: 1500,
        products: [{ productId: prod.id, quantity: 1 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it("returns 422 when product usage would bring stock to 0", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 2 })

    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "AAA111",
        washType: "integro",
        amount: 2000,
        products: [{ productId: prod.id, quantity: 2 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toMatch(/stock insuficiente/i)
  })

  it("returns 422 when product usage would bring stock below 0", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 1 })

    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "BBB222",
        washType: "exterior",
        amount: 1500,
        products: [{ productId: prod.id, quantity: 5 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(422)
  })

  it("allows wash that leaves exactly 1 unit in stock", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 5 })

    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "CCC333",
        washType: "interior",
        amount: 1800,
        products: [{ productId: prod.id, quantity: 4 }],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const updated = await prisma.producto.findUnique({ where: { id: prod.id } })
    expect(updated!.stock).toBe(1)
  })

  it("creates a session linked to a registered vehicle when vehicleId is provided", async () => {
    const cliente = await createCliente()
    const vehiculo = await createVehiculo(cliente.id)

    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: vehiculo.id,
        washType: "integro",
        amount: 2000,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.vehicleId).toBe(vehiculo.id)
  })

  it("creates a session with plate only (walk-in, unregistered vehicle)", async () => {
    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: "WALKIN01", washType: "exterior", amount: 1500 }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.plate).toBe("WALKIN01")
    expect(body.vehicleId).toBeNull()
  })

  it("returns 404 when vehicleId does not exist", async () => {
    const req = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId: "non-existent-id", washType: "integro", amount: 2000 }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it("creates or reuses a TurnoLavaAuto for today on each session", async () => {
    const req1 = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: "P1", washType: "interior", amount: 1000 }),
    })
    const req2 = new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: "P2", washType: "interior", amount: 1000 }),
    })

    await POST(req1)
    await POST(req2)

    // Both sessions must share the same turno for today
    const turnos = await prisma.turnoLavaAuto.findMany()
    expect(turnos).toHaveLength(1)

    const sessions = await prisma.sesionLavaAuto.findMany()
    expect(sessions).toHaveLength(2)
    expect(sessions[0].turnoId).toBe(sessions[1].turnoId)
  })
})

// ─── GET /api/lava-auto ───────────────────────────────────────────────────────

describe("GET /api/lava-auto", () => {
  it("returns paginated response shape when no sessions exist", async () => {
    const res = await GET(new NextRequest("http://localhost/api/lava-auto"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("sessions")
    expect(body).toHaveProperty("total")
    expect(body).toHaveProperty("page")
    expect(body).toHaveProperty("pageSize")
    expect(body.sessions).toEqual([])
    expect(body.total).toBe(0)
  })

  it("returns sessions with turno and products included", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 20 })

    await POST(new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "TST001",
        washType: "integro",
        amount: 2000,
        products: [{ productId: prod.id, quantity: 1 }],
      }),
    }))

    const res = await GET(new NextRequest("http://localhost/api/lava-auto"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.total).toBe(1)
    expect(body.sessions[0].turno).toBeDefined()
    expect(body.sessions[0].products).toHaveLength(1)
  })

  it("page=2 returns empty when only one page of results exists", async () => {
    await POST(new NextRequest("http://localhost/api/lava-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: "PG001", washType: "exterior", amount: 1000 }),
    }))

    const res = await GET(new NextRequest("http://localhost/api/lava-auto?page=2"))
    const body = await res.json()
    expect(body.page).toBe(2)
    expect(body.sessions).toEqual([])
  })
})
