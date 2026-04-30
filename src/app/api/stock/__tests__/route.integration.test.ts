import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { POST } from "@/app/api/stock/route"
import { DELETE } from "@/app/api/stock/[id]/route"
import { cleanDatabase, createCategoria } from "@/tests/setup/helpers"

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe("POST /api/stock", () => {
  it("creates a product and records an initial stock movement when stock > 0", async () => {
    const cat = await createCategoria()

    const req = new NextRequest("http://localhost/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Aceite 10W40",
        categoryId: cat.id,
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

    const movement = await prisma.movimientoStock.findFirst({
      where: { productId: body.id },
    })
    expect(movement).not.toBeNull()
    expect(movement!.type).toBe("entry")
    expect(movement!.quantity).toBe(5)
    expect(movement!.reason).toBe("Stock inicial")
  })

  it("creates a product without a stock movement when stock is 0", async () => {
    const cat = await createCategoria()

    const req = new NextRequest("http://localhost/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Filtro de aire",
        categoryId: cat.id,
        buyPrice: 200,
        sellPrice: 350,
        stock: 0,
        minStock: 1,
        unit: "unidad",
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    const body = await res.json()
    const movements = await prisma.movimientoStock.findMany({
      where: { productId: body.id },
    })
    expect(movements).toHaveLength(0)
  })
})

describe("DELETE /api/stock/[id]", () => {
  it("soft-deletes a product (sets active=false, does not remove the row)", async () => {
    const cat = await createCategoria()
    const product = await prisma.producto.create({
      data: {
        name: "Producto a eliminar",
        categoryId: cat.id,
        buyPrice: 100,
        sellPrice: 150,
        stock: 3,
        minStock: 1,
        unit: "unidad",
      },
    })

    const req = new NextRequest(`http://localhost/api/stock/${product.id}`, {
      method: "DELETE",
    })
    const res = await DELETE(req, { params: Promise.resolve({ id: product.id }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)

    const row = await prisma.producto.findUnique({ where: { id: product.id } })
    expect(row).not.toBeNull()
    expect(row!.active).toBe(false)
  })
})
