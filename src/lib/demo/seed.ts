// Demo seed — no external imports. All monetary values are plain numbers.

export function createSeedData() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const threeDaysAgo = new Date(today.getTime() - 3 * 86400000)

  // ── IDs ───────────────────────────────────────────────────────────────
  const CAT = {
    aceites: "cat-aceites",
    filtros: "cat-filtros",
    bujias: "cat-bujias",
    frenos: "cat-frenos",
    neumaticos: "cat-neumaticos",
    accesorios: "cat-accesorios",
  }
  const MAR = {
    castrol: "mar-castrol",
    bosch: "mar-bosch",
    ngk: "mar-ngk",
    wagner: "mar-wagner",
    ypf: "mar-ypf",
  }
  const PROD = {
    aceite1040: "prod-001",
    aceite2050: "prod-002",
    filtroAceite: "prod-003",
    filtroAire: "prod-004",
    bujia: "prod-005",
    pastillas: "prod-006",
    liquidoFreno: "prod-007",
    bateria: "prod-008",
    limpiaparabrisas: "prod-009",
    aceiteCaja: "prod-010",
    grasa: "prod-011",
    refrigerante: "prod-012",
  }
  const CLI = {
    rodriguez: "cli-001",
    gomez: "cli-002",
    fernandez: "cli-003",
    sanchez: "cli-004",
    perez: "cli-005",
  }
  const VEH = {
    gol: "veh-001",
    ranger: "veh-002",
    s10: "veh-003",
    hilux: "veh-004",
    civic: "veh-005",
    peugeot: "veh-006",
    sandero: "veh-007",
  }
  const PROV = {
    norte: "prov-001",
    sur: "prov-002",
    lubricar: "prov-003",
  }

  // ── Categorias ────────────────────────────────────────────────────────
  const categorias = [
    { id: CAT.aceites, name: "Aceites y Lubricantes", createdAt: threeDaysAgo },
    { id: CAT.filtros, name: "Filtros", createdAt: threeDaysAgo },
    { id: CAT.bujias, name: "Bujías", createdAt: threeDaysAgo },
    { id: CAT.frenos, name: "Frenos", createdAt: threeDaysAgo },
    { id: CAT.neumaticos, name: "Neumáticos", createdAt: threeDaysAgo },
    { id: CAT.accesorios, name: "Accesorios", createdAt: threeDaysAgo },
  ]

  // ── Marcas ────────────────────────────────────────────────────────────
  const marcas = [
    { id: MAR.castrol, name: "Castrol", createdAt: threeDaysAgo },
    { id: MAR.bosch, name: "Bosch", createdAt: threeDaysAgo },
    { id: MAR.ngk, name: "NGK", createdAt: threeDaysAgo },
    { id: MAR.wagner, name: "Wagner", createdAt: threeDaysAgo },
    { id: MAR.ypf, name: "YPF", createdAt: threeDaysAgo },
  ]

  // ── Productos ─────────────────────────────────────────────────────────
  const productos = [
    {
      id: PROD.aceite1040, name: "Aceite Castrol 10W40 5L", code: "ACE-001",
      categoryId: CAT.aceites, brandId: MAR.castrol,
      buyPrice: 3800, sellPrice: 5200, stock: 45, minStock: 10, unit: "unidad",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.aceite2050, name: "Aceite YPF Elaion 20W50 4L", code: "ACE-002",
      categoryId: CAT.aceites, brandId: MAR.ypf,
      buyPrice: 2900, sellPrice: 4100, stock: 30, minStock: 8, unit: "unidad",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.filtroAceite, name: "Filtro de aceite Bosch", code: "FIL-001",
      categoryId: CAT.filtros, brandId: MAR.bosch,
      buyPrice: 850, sellPrice: 1400, stock: 60, minStock: 15, unit: "unidad",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.filtroAire, name: "Filtro de aire Bosch", code: "FIL-002",
      categoryId: CAT.filtros, brandId: MAR.bosch,
      buyPrice: 1100, sellPrice: 1800, stock: 40, minStock: 10, unit: "unidad",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.bujia, name: "Bujía NGK BPR6ES", code: "BUJ-001",
      categoryId: CAT.bujias, brandId: MAR.ngk,
      buyPrice: 350, sellPrice: 620, stock: 80, minStock: 20, unit: "unidad",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.pastillas, name: "Pastillas de freno Wagner", code: "FRE-001",
      categoryId: CAT.frenos, brandId: MAR.wagner,
      buyPrice: 2200, sellPrice: 3500, stock: 24, minStock: 6, unit: "juego",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.liquidoFreno, name: "Líquido de frenos DOT4 500ml", code: "FRE-002",
      categoryId: CAT.frenos, brandId: null,
      buyPrice: 480, sellPrice: 750, stock: 35, minStock: 10, unit: "unidad",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.bateria, name: "Batería 12V 60Ah", code: "ACC-001",
      categoryId: CAT.accesorios, brandId: null,
      buyPrice: 18000, sellPrice: 25000, stock: 8, minStock: 3, unit: "unidad",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.limpiaparabrisas, name: "Limpiaparabrisas Bosch 600mm", code: "ACC-002",
      categoryId: CAT.accesorios, brandId: MAR.bosch,
      buyPrice: 1200, sellPrice: 1900, stock: 20, minStock: 5, unit: "par",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.aceiteCaja, name: "Aceite de caja 80W90 1L", code: "ACE-003",
      categoryId: CAT.aceites, brandId: MAR.ypf,
      buyPrice: 1500, sellPrice: 2300, stock: 15, minStock: 5, unit: "litro",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.grasa, name: "Grasa multiuso 500g", code: "ACC-003",
      categoryId: CAT.accesorios, brandId: null,
      buyPrice: 290, sellPrice: 480, stock: 50, minStock: 12, unit: "pote",
      active: true, expectedConsumptionPerWash: 0.15,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROD.refrigerante, name: "Refrigerante verde 5L", code: "ACC-004",
      categoryId: CAT.accesorios, brandId: null,
      buyPrice: 1800, sellPrice: 2800, stock: 3, minStock: 6, unit: "bidón",
      active: true, expectedConsumptionPerWash: null,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
  ]

  // ── Clientes ──────────────────────────────────────────────────────────
  const clientes = [
    {
      id: CLI.rodriguez, firstName: "Juan Carlos", lastName: "Rodríguez",
      phone: "11-4523-7890", email: "jcrodriguez@gmail.com", dni: "28.455.891",
      active: true, createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: CLI.gomez, firstName: "María Elena", lastName: "Gómez",
      phone: "11-6789-0123", email: null, dni: "32.110.445",
      active: true, createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: CLI.fernandez, firstName: "Roberto", lastName: "Fernández",
      phone: "341-456-7890", email: "rfernandez@outlook.com", dni: "25.778.332",
      active: true, createdAt: yesterday, updatedAt: yesterday,
    },
    {
      id: CLI.sanchez, firstName: "Laura Beatriz", lastName: "Sánchez",
      phone: "11-2345-6789", email: null, dni: "40.223.667",
      active: true, createdAt: yesterday, updatedAt: yesterday,
    },
    {
      id: CLI.perez, firstName: "Carlos Javier", lastName: "Pérez",
      phone: "11-8901-2345", email: "cperez@yahoo.com.ar", dni: "22.990.115",
      active: true, createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
  ]

  // ── Vehiculos ─────────────────────────────────────────────────────────
  const vehiculos = [
    {
      id: VEH.gol, plate: "AE 123 BT", brand: "Volkswagen", model: "Gol",
      year: 2018, engine: "1.6 nafta", clientId: CLI.rodriguez,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: VEH.ranger, plate: "FGH 456", brand: "Ford", model: "Ranger",
      year: 2021, engine: "2.0 diesel", clientId: CLI.rodriguez,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: VEH.s10, plate: "MNO 789", brand: "Chevrolet", model: "S10",
      year: 2019, engine: "2.8 diesel", clientId: CLI.gomez,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: VEH.hilux, plate: "RST 012", brand: "Toyota", model: "Hilux",
      year: 2022, engine: "2.8 TDI diesel", clientId: CLI.fernandez,
      createdAt: yesterday, updatedAt: yesterday,
    },
    {
      id: VEH.civic, plate: "ABC 345", brand: "Honda", model: "Civic",
      year: 2020, engine: "1.5 turbo nafta", clientId: CLI.sanchez,
      createdAt: yesterday, updatedAt: yesterday,
    },
    {
      id: VEH.peugeot, plate: "DEF 678", brand: "Peugeot", model: "208",
      year: 2017, engine: "1.6 nafta", clientId: CLI.perez,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: VEH.sandero, plate: "GHI 901", brand: "Renault", model: "Sandero",
      year: 2016, engine: "1.6 nafta", clientId: CLI.perez,
      createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
  ]

  // ── Proveedores ───────────────────────────────────────────────────────
  const proveedores = [
    {
      id: PROV.norte, name: "Distribuidora Automotriz Norte",
      contactName: "Gustavo Herrera", phone: "11-5544-3322",
      email: "ventas@distnorte.com.ar", address: "Av. Corrientes 4520, CABA",
      active: true, createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROV.sur, name: "Repuestos del Sur S.A.",
      contactName: "Ana Villalba", phone: "11-7788-9900",
      email: "ana@repuestossur.com.ar", address: "Ruta 3 km 42, La Matanza",
      active: true, createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
    {
      id: PROV.lubricar, name: "Importadora Lubricar",
      contactName: "Diego Morales", phone: "11-3322-1100",
      email: "contacto@lubricar.com.ar", address: "Av. Rivadavia 8900, Liniers",
      active: true, createdAt: threeDaysAgo, updatedAt: threeDaysAgo,
    },
  ]

  const proveedorProductos = [
    { id: "pp-001", supplierId: PROV.norte, productId: PROD.aceite1040 },
    { id: "pp-002", supplierId: PROV.norte, productId: PROD.filtroAceite },
    { id: "pp-003", supplierId: PROV.sur, productId: PROD.pastillas },
    { id: "pp-004", supplierId: PROV.sur, productId: PROD.bujia },
    { id: "pp-005", supplierId: PROV.lubricar, productId: PROD.aceite2050 },
    { id: "pp-006", supplierId: PROV.lubricar, productId: PROD.aceiteCaja },
  ]

  const compras = [
    {
      id: "compra-001", supplierId: PROV.norte,
      total: 42500, notes: "Pedido mensual aceites y filtros",
      createdAt: threeDaysAgo,
    },
    {
      id: "compra-002", supplierId: PROV.sur,
      total: 18700, notes: "Reposición pastillas y bujías",
      createdAt: yesterday,
    },
  ]

  // ── Turno & Sesiones Lava Auto ────────────────────────────────────────
  const turnoId = "turno-hoy"
  const turnos = [
    {
      id: turnoId,
      date: today,
      startedAt: new Date(today.getTime() + 8 * 3600000), // 08:00
      endedAt: null,
      notes: null,
      createdAt: new Date(today.getTime() + 8 * 3600000),
    },
  ]

  const sesiones = [
    {
      id: "ses-001", plate: "ABC 123", vehicleId: null,
      washType: "interior", amount: 3500, notes: null,
      sessionDate: new Date(today.getTime() + 9 * 3600000),
      turnoId, createdAt: new Date(today.getTime() + 9 * 3600000),
    },
    {
      id: "ses-002", plate: "GHI 901", vehicleId: VEH.sandero,
      washType: "exterior", amount: 2500, notes: null,
      sessionDate: new Date(today.getTime() + 10 * 3600000),
      turnoId, createdAt: new Date(today.getTime() + 10 * 3600000),
    },
    {
      id: "ses-003", plate: "XYZ 789", vehicleId: null,
      washType: "integro", amount: 5500, notes: "Limpieza interior profunda",
      sessionDate: new Date(today.getTime() + 11 * 3600000),
      turnoId, createdAt: new Date(today.getTime() + 11 * 3600000),
    },
  ]

  const sesionProductos = [
    { id: "sesp-001", sessionId: "ses-002", productId: PROD.grasa, quantity: 1 },
    { id: "sesp-002", sessionId: "ses-003", productId: PROD.grasa, quantity: 2 },
  ]

  // ── Config ────────────────────────────────────────────────────────────
  const configLavaAuto = {
    id: "config-lava-001",
    priceInterior: 3500,
    priceExterior: 2500,
    priceIntegro: 5500,
    updatedAt: threeDaysAgo,
  }

  const configServicio = {
    id: "config-svc-001",
    servicePrice: 8500,
    updatedAt: threeDaysAgo,
  }

  // ── Servicios ─────────────────────────────────────────────────────────
  const servicios = [
    {
      id: "svc-001", vehicleId: VEH.gol,
      mileage: 78500, nextServiceKm: 88500,
      serviceDate: new Date(threeDaysAgo.getTime() + 10 * 3600000),
      nextServiceDate: null, amount: 8500, notes: "Cambio de aceite y filtro",
      turnoId: null, createdAt: new Date(threeDaysAgo.getTime() + 10 * 3600000),
    },
    {
      id: "svc-002", vehicleId: VEH.s10,
      mileage: 52300, nextServiceKm: null,
      serviceDate: new Date(yesterday.getTime() + 14 * 3600000),
      nextServiceDate: null, amount: 8500, notes: "Cambio de pastillas delanteras",
      turnoId: null, createdAt: new Date(yesterday.getTime() + 14 * 3600000),
    },
    {
      id: "svc-003", vehicleId: VEH.hilux,
      mileage: 34200, nextServiceKm: null,
      serviceDate: new Date(today.getTime() + 9 * 3600000),
      nextServiceDate: null, amount: 8500, notes: "Cambio de bujías",
      turnoId, createdAt: new Date(today.getTime() + 9 * 3600000),
    },
  ]

  const servicioProductos = [
    { id: "svcp-001", serviceId: "svc-001", productId: PROD.aceite1040, quantity: 1, price: 5200 },
    { id: "svcp-002", serviceId: "svc-001", productId: PROD.filtroAceite, quantity: 1, price: 1400 },
    { id: "svcp-003", serviceId: "svc-002", productId: PROD.pastillas, quantity: 1, price: 3500 },
    { id: "svcp-004", serviceId: "svc-003", productId: PROD.bujia, quantity: 4, price: 620 },
  ]

  // ── Ventas ────────────────────────────────────────────────────────────
  const ventas = [
    {
      id: "vta-001", clientId: CLI.rodriguez,
      total: 6600, discount: 0, status: "completed",
      turnoId, createdAt: new Date(today.getTime() + 10 * 3600000),
    },
    {
      id: "vta-002", clientId: null,
      total: 4100, discount: 0, status: "completed",
      turnoId, createdAt: new Date(today.getTime() + 11 * 3600000),
    },
    {
      id: "vta-003", clientId: CLI.gomez,
      total: 4630, discount: 0, status: "completed",
      turnoId: null, createdAt: new Date(yesterday.getTime() + 15 * 3600000),
    },
    {
      id: "vta-004", clientId: CLI.fernandez,
      total: 3500, discount: 0, status: "cancelled",
      turnoId: null, createdAt: new Date(yesterday.getTime() + 16 * 3600000),
    },
  ]

  const detallesVenta = [
    { id: "dv-001-1", saleId: "vta-001", productId: PROD.aceite1040, quantity: 1, price: 5200 },
    { id: "dv-001-2", saleId: "vta-001", productId: PROD.filtroAceite, quantity: 1, price: 1400 },
    { id: "dv-002-1", saleId: "vta-002", productId: PROD.aceite2050, quantity: 1, price: 4100 },
    { id: "dv-003-1", saleId: "vta-003", productId: PROD.bujia, quantity: 4, price: 620 },
    { id: "dv-003-2", saleId: "vta-003", productId: PROD.filtroAceite, quantity: 1, price: 1400 },
    { id: "dv-003-3", saleId: "vta-003", productId: PROD.liquidoFreno, quantity: 1, price: 750 },
    { id: "dv-004-1", saleId: "vta-004", productId: PROD.pastillas, quantity: 1, price: 3500 },
  ]

  // ── MovimientosStock (historical context only) ────────────────────────
  const movimientos = [
    { id: "mov-001", productId: PROD.aceite1040, type: "entry", quantity: 50, reason: "Stock inicial", createdAt: threeDaysAgo },
    { id: "mov-002", productId: PROD.aceite1040, type: "exit", quantity: 2, reason: "Servicio #svc-001 y Venta #vta-001", createdAt: today },
    { id: "mov-003", productId: PROD.filtroAceite, type: "entry", quantity: 65, reason: "Stock inicial", createdAt: threeDaysAgo },
    { id: "mov-004", productId: PROD.filtroAceite, type: "exit", quantity: 3, reason: "Servicios y ventas", createdAt: today },
    { id: "mov-005", productId: PROD.bujia, type: "entry", quantity: 90, reason: "Stock inicial", createdAt: threeDaysAgo },
    { id: "mov-006", productId: PROD.bujia, type: "exit", quantity: 8, reason: "Servicio y venta", createdAt: today },
    { id: "mov-007", productId: PROD.refrigerante, type: "entry", quantity: 10, reason: "Stock inicial", createdAt: threeDaysAgo },
    { id: "mov-008", productId: PROD.refrigerante, type: "exit", quantity: 7, reason: "Ventas", createdAt: yesterday },
  ]

  return {
    categorias,
    marcas,
    productos,
    movimientos,
    clientes,
    vehiculos,
    servicios,
    servicioProductos,
    ventas,
    detallesVenta,
    proveedores,
    proveedorProductos,
    compras,
    sesiones,
    sesionProductos,
    turnos,
    configLavaAuto,
    configServicio,
  }
}
