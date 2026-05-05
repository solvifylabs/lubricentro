import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { POST } from "@/app/api/ventas/route"
import { PATCH } from "@/app/api/ventas/[id]/route"
import { cleanDatabase, createCategoria, createProducto } from "@/tests/setup/helpers"

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe("POST /api/ventas", () => {
  it("creates a venta, decrements stock, and records a MovimientoStock per item", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 10 })

    const req = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 3, price: 150 }],
        discount: 0,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body.total).toBe("450")

    // Stock must be decremented
    const updated = await prisma.producto.findUnique({ where: { id: prod.id } })
    expect(updated!.stock).toBe(7)

    // MovimientoStock must be created
    const movement = await prisma.movimientoStock.findFirst({
      where: { productId: prod.id },
    })
    expect(movement).not.toBeNull()
    expect(movement!.type).toBe("exit")
    expect(movement!.quantity).toBe(3)
  })

  it("applies discount correctly to the total", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 5 })

    const req = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 2, price: 100 }],
        discount: 50,
      }),
    })

    const res = await POST(req)
    const body = await res.json()
    // total = (2 * 100) - 50 = 150
    expect(body.total).toBe("150")
  })

  it("decrements stock for multiple items atomically", async () => {
    const cat = await createCategoria()
    const prod1 = await createProducto(cat.id, { stock: 8 })
    const prod2 = await createProducto(cat.id, { stock: 6 })

    const req = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { productId: prod1.id, quantity: 3, price: 100 },
          { productId: prod2.id, quantity: 2, price: 150 },
        ],
        discount: 0,
      }),
    })

    await POST(req)

    const [p1, p2] = await Promise.all([
      prisma.producto.findUnique({ where: { id: prod1.id } }),
      prisma.producto.findUnique({ where: { id: prod2.id } }),
    ])
    expect(p1!.stock).toBe(5)
    expect(p2!.stock).toBe(4)
  })
})

describe("POST /api/ventas — input guard", () => {
  it("returns 400 when an item has quantity 0", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 5 })

    const req = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 0, price: 100 }],
        discount: 0,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/cantidad/i)
  })

  it("returns 404 when selling a soft-deleted (inactive) product", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 5, active: false })

    const req = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 1, price: 100 }],
        discount: 0,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })
})

describe("POST /api/ventas — stock guard", () => {
  it("returns 422 when sale would bring stock to 0", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 5 })

    const req = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 5, price: 100 }],
        discount: 0,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toMatch(/stock insuficiente/i)
  })

  it("returns 422 when sale would bring stock below 0", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 3 })

    const req = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 10, price: 100 }],
        discount: 0,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(422)
  })

  it("allows sale that leaves exactly 1 unit in stock", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 5 })

    const req = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 4, price: 100 }],
        discount: 0,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const updated = await prisma.producto.findUnique({ where: { id: prod.id } })
    expect(updated!.stock).toBe(1)
  })
})

describe("PATCH /api/ventas/[id] — cancellation", () => {
  it("restores stock and creates a MovimientoStock entry on cancellation", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 10 })

    // Create a sale first
    const createReq = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 4, price: 150 }],
        discount: 0,
      }),
    })
    const createRes = await POST(createReq)
    const sale = await createRes.json()

    // Stock should be 6 after the sale
    const afterSale = await prisma.producto.findUnique({ where: { id: prod.id } })
    expect(afterSale!.stock).toBe(6)

    // Cancel the sale
    const patchReq = new NextRequest(`http://localhost/api/ventas/${sale.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    })
    const patchRes = await PATCH(patchReq, { params: Promise.resolve({ id: sale.id }) })
    expect(patchRes.status).toBe(200)

    // Stock must be restored
    const afterCancel = await prisma.producto.findUnique({ where: { id: prod.id } })
    expect(afterCancel!.stock).toBe(10)

    // A compensating MovimientoStock entry must exist
    const movements = await prisma.movimientoStock.findMany({
      where: { productId: prod.id, type: "entry" },
    })
    expect(movements.length).toBeGreaterThan(0)
    expect(movements[0].quantity).toBe(4)
  })

  it("returns 409 when cancelling an already-cancelled sale", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 10 })

    const createReq = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 2, price: 100 }],
        discount: 0,
      }),
    })
    const createRes = await POST(createReq)
    const sale = await createRes.json()

    const cancelReq = () =>
      new NextRequest(`http://localhost/api/ventas/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

    await PATCH(cancelReq(), { params: Promise.resolve({ id: sale.id }) })
    const secondRes = await PATCH(cancelReq(), { params: Promise.resolve({ id: sale.id }) })

    expect(secondRes.status).toBe(409)

    // Stock must not have been restored twice
    const final = await prisma.producto.findUnique({ where: { id: prod.id } })
    expect(final!.stock).toBe(10)
  })

  it("does not touch stock when updating status to non-cancelled", async () => {
    const cat = await createCategoria()
    const prod = await createProducto(cat.id, { stock: 10 })

    const createReq = new NextRequest("http://localhost/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: prod.id, quantity: 2, price: 100 }],
        discount: 0,
      }),
    })
    const createRes = await POST(createReq)
    const sale = await createRes.json()

    const patchReq = new NextRequest(`http://localhost/api/ventas/${sale.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    })
    await PATCH(patchReq, { params: Promise.resolve({ id: sale.id }) })

    const product = await prisma.producto.findUnique({ where: { id: prod.id } })
    expect(product!.stock).toBe(8) // unchanged from the sale decrement
  })
})
