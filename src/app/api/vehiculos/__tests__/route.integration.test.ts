import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { POST, GET } from "@/app/api/vehiculos/route"
import { GET as GET_ONE, PATCH } from "@/app/api/vehiculos/[id]/route"
import { cleanDatabase, createCliente, createVehiculo } from "@/tests/setup/helpers"

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

// ─── POST /api/vehiculos ──────────────────────────────────────────────────────

describe("POST /api/vehiculos — creation", () => {
  it("creates a vehicle when all required fields are provided", async () => {
    const cliente = await createCliente()

    const req = new NextRequest("http://localhost/api/vehiculos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "ABC123",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        engine: "1.8",
        clientId: cliente.id,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.plate).toBe("ABC123")
    expect(body.clientId).toBe(cliente.id)
  })

  it("returns 400 when clientId is missing", async () => {
    const req = new NextRequest("http://localhost/api/vehiculos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: "XYZ999", brand: "Ford", model: "Focus", year: 2019, engine: "2.0" }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 when year is missing", async () => {
    const cliente = await createCliente()

    const req = new NextRequest("http://localhost/api/vehiculos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: "AAA111", brand: "Ford", model: "Focus", engine: "2.0", clientId: cliente.id }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 404 when clientId does not exist", async () => {
    const req = new NextRequest("http://localhost/api/vehiculos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: "GHOST1",
        brand: "Toyota",
        model: "Hilux",
        year: 2021,
        engine: "2.8",
        clientId: "non-existent-id",
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it("returns 409 when plate is already registered", async () => {
    const cliente = await createCliente()
    await createVehiculo(cliente.id) // plate is deterministic per test via Date.now — use explicit plate

    // Create first vehicle directly
    await prisma.vehiculo.create({
      data: { plate: "DUP001", brand: "Honda", model: "Civic", year: 2018, engine: "1.6", clientId: cliente.id },
    })

    const req = new NextRequest("http://localhost/api/vehiculos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: "DUP001", brand: "Nissan", model: "March", year: 2020, engine: "1.2", clientId: cliente.id }),
    })

    const res = await POST(req)
    expect(res.status).toBe(409)
  })
})

// ─── GET /api/vehiculos — filtering ──────────────────────────────────────────

describe("GET /api/vehiculos — clientId filter", () => {
  it("returns only vehicles belonging to the requested client", async () => {
    const c1 = await createCliente()
    const c2 = await createCliente()
    await createVehiculo(c1.id)
    await createVehiculo(c1.id)
    await createVehiculo(c2.id)

    const req = new NextRequest(`http://localhost/api/vehiculos?clientId=${c1.id}`)
    const res = await GET(req)
    const body = await res.json()

    expect(body).toHaveLength(2)
    expect(body.every((v: { clientId: string }) => v.clientId === c1.id)).toBe(true)
  })

  it("one client can own multiple vehicles", async () => {
    const cliente = await createCliente()
    await createVehiculo(cliente.id)
    await createVehiculo(cliente.id)
    await createVehiculo(cliente.id)

    const found = await prisma.cliente.findUnique({
      where: { id: cliente.id },
      include: { vehicles: true },
    })
    expect(found!.vehicles).toHaveLength(3)
    expect(found!.vehicles.every(v => v.clientId === cliente.id)).toBe(true)
  })
})

// ─── GET /api/vehiculos/[id] ──────────────────────────────────────────────────

describe("GET /api/vehiculos/[id]", () => {
  it("returns vehicle with nested client info", async () => {
    const cliente = await createCliente()
    const vehiculo = await createVehiculo(cliente.id)

    const req = new NextRequest(`http://localhost/api/vehiculos/${vehiculo.id}`)
    const res = await GET_ONE(req, { params: Promise.resolve({ id: vehiculo.id }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.client.id).toBe(cliente.id)
  })

  it("returns 404 for unknown id", async () => {
    const req = new NextRequest("http://localhost/api/vehiculos/non-existent")
    const res = await GET_ONE(req, { params: Promise.resolve({ id: "non-existent" }) })
    expect(res.status).toBe(404)
  })
})

// ─── PATCH /api/vehiculos/[id] ────────────────────────────────────────────────

describe("PATCH /api/vehiculos/[id] — validation", () => {
  it("returns 400 when clientId is missing on update", async () => {
    const cliente = await createCliente()
    const vehiculo = await createVehiculo(cliente.id)

    const req = new NextRequest(`http://localhost/api/vehiculos/${vehiculo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate: vehiculo.plate, brand: "Fiat", model: "Uno", year: 2015, engine: "1.4" }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: vehiculo.id }) })
    expect(res.status).toBe(400)
  })

  it("returns 404 when reassigning to a non-existent client", async () => {
    const cliente = await createCliente()
    const vehiculo = await createVehiculo(cliente.id)

    const req = new NextRequest(`http://localhost/api/vehiculos/${vehiculo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: vehiculo.plate,
        brand: "Fiat",
        model: "Uno",
        year: 2015,
        engine: "1.4",
        clientId: "non-existent-id",
      }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: vehiculo.id }) })
    expect(res.status).toBe(404)
  })
})
