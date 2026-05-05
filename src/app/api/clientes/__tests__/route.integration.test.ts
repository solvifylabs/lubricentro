import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { POST, GET } from "@/app/api/clientes/route"
import { GET as GET_ONE, PATCH, DELETE } from "@/app/api/clientes/[id]/route"
import { cleanDatabase, createCliente, createVehiculo } from "@/tests/setup/helpers"

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

// ─── POST /api/clientes ───────────────────────────────────────────────────────

describe("POST /api/clientes — creation", () => {
  it("creates a client with required fields only", async () => {
    const req = new NextRequest("http://localhost/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Juan" }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.firstName).toBe("Juan")
    expect(body.active).toBe(true)
  })

  it("returns 400 when firstName is missing", async () => {
    const req = new NextRequest("http://localhost/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastName: "Pérez", phone: "1234" }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

// ─── GET /api/clientes ────────────────────────────────────────────────────────

describe("GET /api/clientes", () => {
  it("returns only active clients", async () => {
    await createCliente()
    const inactive = await createCliente()
    await prisma.cliente.update({ where: { id: inactive.id }, data: { active: false } })

    const req = new NextRequest("http://localhost/api/clientes")
    const res = await GET(req)
    const body = await res.json()

    expect(body.every((c: { active: boolean }) => c.active)).toBe(true)
    expect(body.find((c: { id: string }) => c.id === inactive.id)).toBeUndefined()
  })

  it("returns clients matching search term", async () => {
    await prisma.cliente.create({ data: { firstName: "Carlos", lastName: "Gomez" } })
    await prisma.cliente.create({ data: { firstName: "Maria", lastName: "Lopez" } })

    const req = new NextRequest("http://localhost/api/clientes?search=carlos")
    const res = await GET(req)
    const body = await res.json()

    expect(body).toHaveLength(1)
    expect(body[0].firstName).toBe("Carlos")
  })

  it("includes vehicle count and last vehicles for each client", async () => {
    const cliente = await createCliente()
    await createVehiculo(cliente.id)
    await createVehiculo(cliente.id)

    const req = new NextRequest("http://localhost/api/clientes")
    const res = await GET(req)
    const body = await res.json()
    const found = body.find((c: { id: string }) => c.id === cliente.id)

    expect(found._count.vehicles).toBe(2)
  })
})

// ─── GET /api/clientes/[id] ───────────────────────────────────────────────────

describe("GET /api/clientes/[id]", () => {
  it("returns client with vehicles and sales", async () => {
    const cliente = await createCliente()
    await createVehiculo(cliente.id)

    const req = new NextRequest(`http://localhost/api/clientes/${cliente.id}`)
    const res = await GET_ONE(req, { params: Promise.resolve({ id: cliente.id }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.vehicles).toHaveLength(1)
    expect(body.sales).toBeDefined()
  })

  it("returns 404 for unknown id", async () => {
    const req = new NextRequest("http://localhost/api/clientes/non-existent")
    const res = await GET_ONE(req, { params: Promise.resolve({ id: "non-existent" }) })
    expect(res.status).toBe(404)
  })
})

// ─── PATCH /api/clientes/[id] ─────────────────────────────────────────────────

describe("PATCH /api/clientes/[id]", () => {
  it("updates client fields", async () => {
    const cliente = await createCliente()

    const req = new NextRequest(`http://localhost/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Updated", phone: "999" }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: cliente.id }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.firstName).toBe("Updated")
    expect(body.phone).toBe("999")
  })
})

// ─── DELETE /api/clientes/[id] ────────────────────────────────────────────────

describe("DELETE /api/clientes/[id]", () => {
  it("soft-deletes a client (sets active=false)", async () => {
    const cliente = await createCliente()

    const req = new NextRequest(`http://localhost/api/clientes/${cliente.id}`, { method: "DELETE" })
    const res = await DELETE(req, { params: Promise.resolve({ id: cliente.id }) })

    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)

    const row = await prisma.cliente.findUnique({ where: { id: cliente.id } })
    expect(row!.active).toBe(false)
  })
})
