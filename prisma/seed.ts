import "dotenv/config"
import { config } from "dotenv"
config({ path: ".env.local", override: true })
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Sembrando datos de prueba...")

  // Categorías
  const catAceites = await prisma.categoria.upsert({
    where: { name: "Aceites" },
    update: {},
    create: { name: "Aceites" },
  })
  const catFiltros = await prisma.categoria.upsert({
    where: { name: "Filtros" },
    update: {},
    create: { name: "Filtros" },
  })
  const catAditivos = await prisma.categoria.upsert({
    where: { name: "Aditivos" },
    update: {},
    create: { name: "Aditivos" },
  })
  const catLiquidos = await prisma.categoria.upsert({
    where: { name: "Líquidos" },
    update: {},
    create: { name: "Líquidos" },
  })

  // Marcas
  const castrol = await prisma.marca.upsert({
    where: { name: "Castrol" },
    update: {},
    create: { name: "Castrol" },
  })
  const mobil = await prisma.marca.upsert({
    where: { name: "Mobil" },
    update: {},
    create: { name: "Mobil" },
  })
  const mann = await prisma.marca.upsert({
    where: { name: "Mann Filter" },
    update: {},
    create: { name: "Mann Filter" },
  })
  const wix = await prisma.marca.upsert({
    where: { name: "WIX" },
    update: {},
    create: { name: "WIX" },
  })
  const liquiMoly = await prisma.marca.upsert({
    where: { name: "Liqui Moly" },
    update: {},
    create: { name: "Liqui Moly" },
  })

  // Productos
  const aceite10w40 = await prisma.producto.upsert({
    where: { code: "ACE-001" },
    update: {},
    create: {
      name: "Aceite Castrol GTX 10W40",
      code: "ACE-001",
      categoryId: catAceites.id,
      brandId: castrol.id,
      buyPrice: 3200,
      sellPrice: 4500,
      stock: 48,
      minStock: 10,
      unit: "litro",
    },
  })

  const aceite5w30 = await prisma.producto.upsert({
    where: { code: "ACE-002" },
    update: {},
    create: {
      name: "Aceite Mobil Super 5W30",
      code: "ACE-002",
      categoryId: catAceites.id,
      brandId: mobil.id,
      buyPrice: 3800,
      sellPrice: 5200,
      stock: 30,
      minStock: 10,
      unit: "litro",
    },
  })

  const aceite20w50 = await prisma.producto.upsert({
    where: { code: "ACE-003" },
    update: {},
    create: {
      name: "Aceite Castrol 20W50 Mineral",
      code: "ACE-003",
      categoryId: catAceites.id,
      brandId: castrol.id,
      buyPrice: 2400,
      sellPrice: 3400,
      stock: 3,
      minStock: 10,
      unit: "litro",
    },
  })

  const filtroAceite = await prisma.producto.upsert({
    where: { code: "FIL-001" },
    update: {},
    create: {
      name: "Filtro de Aceite Mann W712/75",
      code: "FIL-001",
      categoryId: catFiltros.id,
      brandId: mann.id,
      buyPrice: 850,
      sellPrice: 1400,
      stock: 25,
      minStock: 8,
      unit: "unidad",
    },
  })

  const filtroAire = await prisma.producto.upsert({
    where: { code: "FIL-002" },
    update: {},
    create: {
      name: "Filtro de Aire WIX 46396",
      code: "FIL-002",
      categoryId: catFiltros.id,
      brandId: wix.id,
      buyPrice: 1100,
      sellPrice: 1800,
      stock: 2,
      minStock: 5,
      unit: "unidad",
    },
  })

  const filtroCombustible = await prisma.producto.upsert({
    where: { code: "FIL-003" },
    update: {},
    create: {
      name: "Filtro Combustible WIX 33481",
      code: "FIL-003",
      categoryId: catFiltros.id,
      brandId: wix.id,
      buyPrice: 1300,
      sellPrice: 2100,
      stock: 12,
      minStock: 5,
      unit: "unidad",
    },
  })

  const aditivo = await prisma.producto.upsert({
    where: { code: "ADI-001" },
    update: {},
    create: {
      name: "Aditivo Liqui Moly Motor Clean",
      code: "ADI-001",
      categoryId: catAditivos.id,
      brandId: liquiMoly.id,
      buyPrice: 1800,
      sellPrice: 2800,
      stock: 18,
      minStock: 5,
      unit: "unidad",
    },
  })

  const liquidoFreno = await prisma.producto.upsert({
    where: { code: "LIQ-001" },
    update: {},
    create: {
      name: "Líquido de Frenos DOT 4",
      code: "LIQ-001",
      categoryId: catLiquidos.id,
      brandId: null,
      buyPrice: 600,
      sellPrice: 1000,
      stock: 20,
      minStock: 6,
      unit: "litro",
    },
  })

  console.log("✅ Productos creados")

  // Clientes
  const cliente1 = await prisma.cliente.create({
    data: {
      firstName: "Carlos",
      lastName: "Rodríguez",
      phone: "2994123456",
      email: "carlos.rodriguez@gmail.com",
      dni: "28456789",
    },
  })

  const cliente2 = await prisma.cliente.create({
    data: {
      firstName: "María",
      lastName: "González",
      phone: "2994654321",
      email: "mariagonzalez@outlook.com",
      dni: "32567890",
    },
  })

  const cliente3 = await prisma.cliente.create({
    data: {
      firstName: "Jorge",
      lastName: "Pérez",
      phone: "2994789012",
      dni: "25678901",
    },
  })

  const cliente4 = await prisma.cliente.create({
    data: {
      firstName: "Lucía",
      lastName: "Martínez",
      phone: "2994345678",
      email: "lucia.martinez@gmail.com",
    },
  })

  console.log("✅ Clientes creados")

  // Vehículos
  const auto1 = await prisma.vehiculo.create({
    data: {
      plate: "ABC123",
      brand: "Toyota",
      model: "Corolla",
      year: 2019,
      engine: "1.8 VVT-i",
      clientId: cliente1.id,
    },
  })

  const auto2 = await prisma.vehiculo.create({
    data: {
      plate: "DEF456",
      brand: "Volkswagen",
      model: "Gol Trend",
      year: 2017,
      engine: "1.6 MSI",
      clientId: cliente1.id,
    },
  })

  const auto3 = await prisma.vehiculo.create({
    data: {
      plate: "GHI789",
      brand: "Ford",
      model: "Ranger",
      year: 2021,
      engine: "3.2 TDCi",
      clientId: cliente2.id,
    },
  })

  const auto4 = await prisma.vehiculo.create({
    data: {
      plate: "JKL012",
      brand: "Renault",
      model: "Kangoo",
      year: 2018,
      engine: "1.6 SCe",
      clientId: cliente3.id,
    },
  })

  const auto5 = await prisma.vehiculo.create({
    data: {
      plate: "MNO345",
      brand: "Chevrolet",
      model: "Cruze",
      year: 2020,
      engine: "1.4 Turbo",
      clientId: cliente4.id,
    },
  })

  console.log("✅ Vehículos creados")

  // Servicios (en los últimos 30 días)
  const hoy = new Date()
  const hace5 = new Date(hoy); hace5.setDate(hoy.getDate() - 5)
  const hace10 = new Date(hoy); hace10.setDate(hoy.getDate() - 10)
  const hace15 = new Date(hoy); hace15.setDate(hoy.getDate() - 15)
  const hace25 = new Date(hoy); hace25.setDate(hoy.getDate() - 25)

  await prisma.$transaction(async (tx) => {
    // Servicio 1
    const svc1 = await tx.servicio.create({
      data: {
        clientId: cliente1.id,
        vehicleId: auto1.id,
        mileage: 85000,
        nextServiceKm: 90000,
        serviceDate: hace25,
        nextServiceDate: new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate()),
        amount: 15400,
        notes: "Cambio de aceite y filtros. Cliente satisfecho.",
      },
    })
    await tx.servicioProducto.createMany({
      data: [
        { serviceId: svc1.id, productId: aceite10w40.id, quantity: 4, price: 4500 },
        { serviceId: svc1.id, productId: filtroAceite.id, quantity: 1, price: 1400 },
      ],
    })
    await tx.producto.update({ where: { id: aceite10w40.id }, data: { stock: { decrement: 4 } } })
    await tx.producto.update({ where: { id: filtroAceite.id }, data: { stock: { decrement: 1 } } })
    await tx.movimientoStock.createMany({
      data: [
        { productId: aceite10w40.id, type: "exit", quantity: 4, reason: `Servicio #${svc1.id.slice(-6)}` },
        { productId: filtroAceite.id, type: "exit", quantity: 1, reason: `Servicio #${svc1.id.slice(-6)}` },
      ],
    })

    // Servicio 2
    const svc2 = await tx.servicio.create({
      data: {
        clientId: cliente2.id,
        vehicleId: auto3.id,
        mileage: 62000,
        nextServiceKm: 67000,
        serviceDate: hace15,
        nextServiceDate: new Date(hoy.getFullYear(), hoy.getMonth() + 2, hoy.getDate()),
        amount: 22000,
        notes: "Service completo. Cambio de aceite, filtro de aire y combustible.",
      },
    })
    await tx.servicioProducto.createMany({
      data: [
        { serviceId: svc2.id, productId: aceite5w30.id, quantity: 5, price: 5200 },
        { serviceId: svc2.id, productId: filtroAire.id, quantity: 1, price: 1800 },
        { serviceId: svc2.id, productId: filtroCombustible.id, quantity: 1, price: 2100 },
      ],
    })
    await tx.producto.update({ where: { id: aceite5w30.id }, data: { stock: { decrement: 5 } } })
    await tx.producto.update({ where: { id: filtroAire.id }, data: { stock: { decrement: 1 } } })
    await tx.producto.update({ where: { id: filtroCombustible.id }, data: { stock: { decrement: 1 } } })

    // Servicio 3
    const svc3 = await tx.servicio.create({
      data: {
        clientId: cliente3.id,
        vehicleId: auto4.id,
        mileage: 110500,
        nextServiceKm: 115500,
        serviceDate: hace10,
        nextServiceDate: new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate()),
        amount: 12000,
        notes: "Solo cambio de aceite.",
      },
    })
    await tx.servicioProducto.createMany({
      data: [
        { serviceId: svc3.id, productId: aceite20w50.id, quantity: 3, price: 3400 },
        { serviceId: svc3.id, productId: filtroAceite.id, quantity: 1, price: 1400 },
      ],
    })
    await tx.producto.update({ where: { id: aceite20w50.id }, data: { stock: { decrement: 3 } } })
    await tx.producto.update({ where: { id: filtroAceite.id }, data: { stock: { decrement: 1 } } })

    // Servicio 4 (reciente)
    const svc4 = await tx.servicio.create({
      data: {
        clientId: cliente4.id,
        vehicleId: auto5.id,
        mileage: 45200,
        nextServiceKm: 50200,
        serviceDate: hace5,
        nextServiceDate: new Date(hoy.getFullYear(), hoy.getMonth() + 4, hoy.getDate()),
        amount: 18500,
        notes: "Cambio aceite + aditivo limpiador de motor.",
      },
    })
    await tx.servicioProducto.createMany({
      data: [
        { serviceId: svc4.id, productId: aceite5w30.id, quantity: 4, price: 5200 },
        { serviceId: svc4.id, productId: aditivo.id, quantity: 1, price: 2800 },
      ],
    })
    await tx.producto.update({ where: { id: aceite5w30.id }, data: { stock: { decrement: 4 } } })
    await tx.producto.update({ where: { id: aditivo.id }, data: { stock: { decrement: 1 } } })

    // Servicio hoy
    const svc5 = await tx.servicio.create({
      data: {
        clientId: cliente1.id,
        vehicleId: auto2.id,
        mileage: 73000,
        nextServiceKm: 78000,
        serviceDate: hoy,
        nextServiceDate: new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate()),
        amount: 14000,
        notes: "Cliente habitual. Recomendar limpieza inyectores en próximo service.",
      },
    })
    await tx.servicioProducto.createMany({
      data: [
        { serviceId: svc5.id, productId: aceite10w40.id, quantity: 3, price: 4500 },
        { serviceId: svc5.id, productId: filtroAceite.id, quantity: 1, price: 1400 },
      ],
    })
    await tx.producto.update({ where: { id: aceite10w40.id }, data: { stock: { decrement: 3 } } })
    await tx.producto.update({ where: { id: filtroAceite.id }, data: { stock: { decrement: 1 } } })
  })

  console.log("✅ Servicios creados")

  // Ventas directas
  await prisma.$transaction(async (tx) => {
    const venta1 = await tx.venta.create({
      data: {
        clientId: cliente2.id,
        total: 5600,
        discount: 0,
        status: "completed",
        createdAt: hace10,
        items: {
          create: [
            { productId: liquidoFreno.id, quantity: 2, price: 1000 },
            { productId: aditivo.id, quantity: 1, price: 2800 },
          ],
        },
      },
    })
    await tx.producto.update({ where: { id: liquidoFreno.id }, data: { stock: { decrement: 2 } } })
    await tx.producto.update({ where: { id: aditivo.id }, data: { stock: { decrement: 1 } } })
    await tx.movimientoStock.createMany({
      data: [
        { productId: liquidoFreno.id, type: "exit", quantity: 2, reason: `Venta #${venta1.id.slice(-6)}` },
        { productId: aditivo.id, type: "exit", quantity: 1, reason: `Venta #${venta1.id.slice(-6)}` },
      ],
    })

    const venta2 = await tx.venta.create({
      data: {
        total: 8550,
        discount: 450,
        status: "completed",
        createdAt: hace5,
        items: {
          create: [
            { productId: aceite10w40.id, quantity: 2, price: 4500 },
            { productId: filtroAceite.id, quantity: 1, price: 1400 },
          ],
        },
      },
    })
    await tx.producto.update({ where: { id: aceite10w40.id }, data: { stock: { decrement: 2 } } })
    await tx.producto.update({ where: { id: filtroAceite.id }, data: { stock: { decrement: 1 } } })
    await tx.movimientoStock.createMany({
      data: [
        { productId: aceite10w40.id, type: "exit", quantity: 2, reason: `Venta #${venta2.id.slice(-6)}` },
        { productId: filtroAceite.id, type: "exit", quantity: 1, reason: `Venta #${venta2.id.slice(-6)}` },
      ],
    })

    // Venta hoy
    const venta3 = await tx.venta.create({
      data: {
        clientId: cliente3.id,
        total: 3400,
        discount: 0,
        status: "completed",
        items: {
          create: [
            { productId: aceite20w50.id, quantity: 1, price: 3400 },
          ],
        },
      },
    })
    await tx.producto.update({ where: { id: aceite20w50.id }, data: { stock: { decrement: 1 } } })
    await tx.movimientoStock.create({
      data: { productId: aceite20w50.id, type: "exit", quantity: 1, reason: `Venta #${venta3.id.slice(-6)}` },
    })
  })

  console.log("✅ Ventas creadas")

  // Proveedor
  await prisma.proveedor.create({
    data: {
      name: "Distribuidora Automotriz del Sur",
      contactName: "Roberto Díaz",
      phone: "2994000111",
      email: "ventas@automotrizelsur.com.ar",
      productLinks: {
        create: [
          { productId: aceite10w40.id },
          { productId: aceite5w30.id },
          { productId: aceite20w50.id },
          { productId: filtroAceite.id },
        ],
      },
    },
  })

  await prisma.proveedor.create({
    data: {
      name: "Mann Filter Argentina",
      contactName: "Sebastián López",
      phone: "1145678901",
      email: "sl@mannfilter.com.ar",
      productLinks: {
        create: [
          { productId: filtroAire.id },
          { productId: filtroCombustible.id },
        ],
      },
    },
  })

  console.log("✅ Proveedores creados")
  console.log("\n🎉 Seed completado exitosamente!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
