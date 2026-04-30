import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { POST } from "@/app/api/lava-auto/route"
import { cleanDatabase, createCategoria, createProducto } from "@/tests/setup/helpers"

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
