import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { POST } from "@/app/api/stock/route"
import { PATCH, DELETE } from "@/app/api/stock/[id]/route"
import { cleanDatabase, createCategoria, createMarca } from "@/tests/setup/helpers"

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

// ─── POST /api/stock — happy path ────────────────────────────────────────────

describe("POST /api/stock — creation", () => {
  it("creates a product and records an initial MovimientoStock", async () => {
    const cat = await createCategoria()
    const marca = await createMarca()

    const req = new NextRequest("http://localhost/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Aceite 10W40",
        categoryId: cat.id,
        brandId: marca.id,
        buyPrice: 800,
        sellPrice: 1200,
        stock: 5,
        minStock: 2,
        unit: "litro",
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body.name).toBe("Aceite 10W40")
    expect(body.stock).toBe(5)

    const movement = await prisma.movimientoStock.findFirst({ where: { productId: body.id } })
    expect(movement).not.toBeNull()
    expect(movement!.type).toBe("entry")
    expect(movement!.quantity).toBe(5)
    expect(movement!.reason).toBe("Stock inicial")
  })
})

// ─── POST /api/stock — validation ────────────────────────────────────────────

describe("POST /api/stock — validation", () => {
  it("returns 400 when categoryId is missing", async () => {
    const marca = await createMarca()
    const req = new NextRequest("http://localhost/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X", brandId: marca.id, buyPrice: 100, sellPrice: 150, stock: 5, minStock: 1 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/categoría/i)
  })

  it("returns 400 when brandId is missing", async () => {
    const cat = await createCategoria()
    const req = new NextRequest("http://localhost/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X", categoryId: cat.id, buyPrice: 100, sellPrice: 150, stock: 5, minStock: 1 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/marca/i)
  })

  it("returns 400 when minStock is 0", async () => {
    const cat = await createCategoria()
    const marca = await createMarca()
    const req = new NextRequest("http://localhost/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X", categoryId: cat.id, brandId: marca.id, buyPrice: 100, sellPrice: 150, stock: 5, minStock: 0 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/stock mínimo/i)
  })

  it("returns 400 when minStock is negative", async () => {
    const cat = await createCategoria()
    const marca = await createMarca()
    const req = new NextRequest("http://localhost/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X", categoryId: cat.id, brandId: marca.id, buyPrice: 100, sellPrice: 150, stock: 5, minStock: -3 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 400 when initial stock is 0", async () => {
    const cat = await createCategoria()
    const marca = await createMarca()
    const req = new NextRequest("http://localhost/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X", categoryId: cat.id, brandId: marca.id, buyPrice: 100, sellPrice: 150, stock: 0, minStock: 1 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/stock inicial/i)
  })

  it("returns 400 when initial stock is negative", async () => {
    const cat = await createCategoria()
    const marca = await createMarca()
    const req = new NextRequest("http://localhost/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X", categoryId: cat.id, brandId: marca.id, buyPrice: 100, sellPrice: 150, stock: -5, minStock: 1 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

// ─── PATCH /api/stock/[id] — validation ──────────────────────────────────────

describe("PATCH /api/stock/[id] — validation", () => {
  it("returns 400 when brandId is missing on update", async () => {
    const cat = await createCategoria()
    const product = await prisma.producto.create({
      data: { name: "Prod", categoryId: cat.id, buyPrice: 100, sellPrice: 150, stock: 5, minStock: 1, unit: "unidad" },
    })

    const req = new NextRequest(`http://localhost/api/stock/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Prod Updated", categoryId: cat.id, buyPrice: 100, sellPrice: 150, minStock: 1, unit: "unidad" }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: product.id }) })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/marca/i)
  })

  it("returns 400 when minStock is 0 on update", async () => {
    const cat = await createCategoria()
    const marca = await createMarca()
    const product = await prisma.producto.create({
      data: { name: "Prod", categoryId: cat.id, brandId: marca.id, buyPrice: 100, sellPrice: 150, stock: 5, minStock: 1, unit: "unidad" },
    })

    const req = new NextRequest(`http://localhost/api/stock/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Prod Updated", categoryId: cat.id, brandId: marca.id, buyPrice: 100, sellPrice: 150, minStock: 0, unit: "unidad" }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: product.id }) })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/stock mínimo/i)
  })

  it("updates successfully when all required fields are valid", async () => {
    const cat = await createCategoria()
    const marca = await createMarca()
    const product = await prisma.producto.create({
      data: { name: "Prod", categoryId: cat.id, brandId: marca.id, buyPrice: 100, sellPrice: 150, stock: 5, minStock: 1, unit: "unidad" },
    })

    const req = new NextRequest(`http://localhost/api/stock/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Prod Updated", categoryId: cat.id, brandId: marca.id, buyPrice: 110, sellPrice: 160, minStock: 2, unit: "unidad" }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: product.id }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe("Prod Updated")
    expect(body.minStock).toBe(2)
  })
})

// ─── DELETE /api/stock/[id] ───────────────────────────────────────────────────

describe("DELETE /api/stock/[id]", () => {
  it("soft-deletes a product (sets active=false, does not remove the row)", async () => {
    const cat = await createCategoria()
    const product = await prisma.producto.create({
      data: { name: "Producto a eliminar", categoryId: cat.id, buyPrice: 100, sellPrice: 150, stock: 3, minStock: 1, unit: "unidad" },
    })

    const req = new NextRequest(`http://localhost/api/stock/${product.id}`, { method: "DELETE" })
    const res = await DELETE(req, { params: Promise.resolve({ id: product.id }) })

    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)

    const row = await prisma.producto.findUnique({ where: { id: product.id } })
    expect(row).not.toBeNull()
    expect(row!.active).toBe(false)
  })
})
