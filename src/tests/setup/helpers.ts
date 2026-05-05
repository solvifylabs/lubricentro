import prisma from "@/lib/prisma"

export async function createCategoria(name = `cat-${Date.now()}`) {
  return prisma.categoria.create({ data: { name } })
}

export async function createMarca(name = `marca-${Date.now()}`) {
  return prisma.marca.create({ data: { name } })
}

export async function createProducto(
  categoryId: string,
  overrides: Record<string, unknown> = {}
) {
  return prisma.producto.create({
    data: {
      name: `producto-${Date.now()}`,
      categoryId,
      buyPrice: 100,
      sellPrice: 150,
      stock: 10,
      minStock: 2,
      unit: "unidad",
      ...overrides,
    },
  })
}

export async function createCliente() {
  return prisma.cliente.create({
    data: { firstName: "Test", lastName: "User" },
  })
}

export async function createVehiculo(clientId: string) {
  return prisma.vehiculo.create({
    data: {
      plate: `TST${Date.now()}`.slice(0, 10),
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      engine: "1.8",
      clientId,
    },
  })
}

// Delete all rows in FK-safe order so each test starts clean
export async function cleanDatabase() {
  await prisma.movimientoStock.deleteMany()
  await prisma.sesionProducto.deleteMany()
  await prisma.servicioProducto.deleteMany()
  await prisma.detalleVenta.deleteMany()
  await prisma.sesionLavaAuto.deleteMany()
  await prisma.venta.deleteMany()
  await prisma.servicio.deleteMany()
  await prisma.turnoLavaAuto.deleteMany()
  await prisma.vehiculo.deleteMany()
  await prisma.proveedorProducto.deleteMany()
  await prisma.compra.deleteMany()
  await prisma.producto.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.marca.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.proveedor.deleteMany()
}
