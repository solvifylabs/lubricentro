// Mock API handlers — mirror real route logic but operate on the Zustand store.
// Each handler receives (url: URL, method: string, body: unknown, getStore: () => DemoStore)
// and returns a Response or null (null = fall through to real fetch).

import { useDemoStore } from "./store"
import type {
  DCategoria, DMarca, DProducto, DMovimiento, DCliente, DVehiculo,
  DServicio, DServicioProducto, DVenta, DDetalleVenta,
  DProveedor, DProveedorProducto, DSesion, DSesionProducto,
  DTurno,
} from "./store"

type Store = ReturnType<typeof useDemoStore.getState>

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function err(message: string, status = 400): Response {
  return json({ error: message }, status)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchStr(val: string | null | undefined, q: string): boolean {
  if (!val) return false
  return val.toLowerCase().includes(q.toLowerCase())
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function parseIntParam(url: URL, name: string, def: number): number {
  const v = url.searchParams.get(name)
  if (!v) return def
  const n = parseInt(v)
  return isNaN(n) ? def : n
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export function handleCategorias(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") return json(s.categorias)
  if (method === "POST") {
    const { name } = body as { name: string }
    if (!name?.trim()) return err("Nombre requerido")
    if (s.categorias.find(c => c.name.toLowerCase() === name.toLowerCase()))
      return err("Ya existe una categoría con ese nombre", 409)
    return json(s.addCategoria(name.trim()), 201)
  }
  if (method === "PATCH") {
    const { id, name } = body as { id: string; name: string }
    // update name inline
    const cat = s.categorias.find(c => c.id === id)
    if (!cat) return err("Categoría no encontrada", 404)
    const updated = { ...cat, name: name.trim() }
    useDemoStore.setState(prev => ({
      categorias: prev.categorias.map(c => c.id === id ? updated : c),
    }))
    return json(updated)
  }
  return err("Método no permitido", 405)
}

// ─── Marcas ───────────────────────────────────────────────────────────────────

export function handleMarcas(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") return json(s.marcas)
  if (method === "POST") {
    const { name } = body as { name: string }
    if (!name?.trim()) return err("Nombre requerido")
    if (s.marcas.find(m => m.name.toLowerCase() === name.toLowerCase()))
      return err("Ya existe una marca con ese nombre", 409)
    return json(s.addMarca(name.trim()), 201)
  }
  return err("Método no permitido", 405)
}

// ─── Movimientos de stock ─────────────────────────────────────────────────────

export function handleMovimientos(url: URL, method: string, body: unknown, s: Store): Response {
  const productId = url.searchParams.get("productId")
  if (method === "GET") {
    let movs = s.movimientos
    if (productId) movs = movs.filter(m => m.productId === productId)
    const withProduct = movs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(m => {
        const prod = s.productos.find(p => p.id === m.productId)
        return { ...m, product: { name: prod?.name ?? "—", code: prod?.code ?? null } }
      })
    return json(withProduct)
  }
  if (method === "POST") {
    const { productId: pid, type, quantity, reason } = body as {
      productId: string; type: string; quantity: number; reason?: string
    }
    const product = s.productos.find(p => p.id === pid && p.active)
    if (!product) return err("Producto no encontrado", 404)
    const delta = type === "exit" ? -Math.abs(quantity) : Math.abs(quantity)
    const mov = s.adjustStock(pid, delta, type, reason ?? "Ajuste manual")
    return json({ ...mov, product: { name: product.name, code: product.code } }, 201)
  }
  return err("Método no permitido", 405)
}

// ─── Stock (productos) ────────────────────────────────────────────────────────

function joinProducto(p: DProducto, s: Store) {
  return {
    ...p,
    category: s.categorias.find(c => c.id === p.categoryId) ?? null,
    brand: p.brandId ? s.marcas.find(m => m.id === p.brandId) ?? null : null,
  }
}

export function handleStock(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") {
    const search = url.searchParams.get("search") ?? ""
    const categoryId = url.searchParams.get("categoryId")
    const lowStock = url.searchParams.get("lowStock") === "true"
    const page = parseIntParam(url, "page", 1)
    const pageSize = parseIntParam(url, "pageSize", 10)

    let products = s.productos.filter(p => p.active)
    if (search) products = products.filter(p =>
      matchStr(p.name, search) || matchStr(p.code, search)
    )
    if (categoryId) products = products.filter(p => p.categoryId === categoryId)
    if (lowStock) products = products.filter(p => p.stock <= p.minStock)
    products = products.sort((a, b) => a.name.localeCompare(b.name))

    const total = products.length
    const paginated = products.slice((page - 1) * pageSize, page * pageSize)
    return json({ products: paginated.map(p => joinProducto(p, s)), total, page, pageSize })
  }
  if (method === "POST") {
    const d = body as Omit<DProducto, "id" | "createdAt" | "updatedAt">
    if (!d.categoryId) return err("categoryId requerido")
    if (!d.name?.trim()) return err("name requerido")
    const prod = s.addProducto({ ...d, active: true })
    if (d.stock > 0) {
      s.adjustStock(prod.id, d.stock, "entry", "Stock inicial")
    }
    return json(joinProducto(prod, useDemoStore.getState()), 201)
  }
  return err("Método no permitido", 405)
}

export function handleStockId(url: URL, method: string, body: unknown, s: Store, id: string): Response {
  const product = s.productos.find(p => p.id === id)
  if (!product) return err("Producto no encontrado", 404)
  if (method === "GET") return json(joinProducto(product, s))
  if (method === "PATCH") {
    const updated = s.updateProducto(id, body as Partial<DProducto>)
    return json(joinProducto(updated, useDemoStore.getState()))
  }
  if (method === "DELETE") {
    s.deactivateProducto(id)
    return json({ success: true })
  }
  return err("Método no permitido", 405)
}

// ─── Clientes ─────────────────────────────────────────────────────────────────

function joinCliente(c: DCliente, s: Store) {
  const vehicles = s.vehiculos.filter(v => v.clientId === c.id)
  return {
    ...c,
    vehicles,
    _count: { vehicles: vehicles.length, sales: s.ventas.filter(v => v.clientId === c.id).length },
  }
}

export function handleClientes(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") {
    const search = url.searchParams.get("search") ?? ""
    const page = parseIntParam(url, "page", 1)
    const pageSize = parseIntParam(url, "pageSize", 10)

    let clients = s.clientes.filter(c => c.active)
    if (search) clients = clients.filter(c =>
      matchStr(c.firstName, search) || matchStr(c.lastName, search) ||
      matchStr(c.phone, search) || matchStr(c.dni, search)
    )
    clients = clients.sort((a, b) => a.firstName.localeCompare(b.firstName))
    const total = clients.length
    const paginated = clients.slice((page - 1) * pageSize, page * pageSize)
    return json({ clients: paginated.map(c => joinCliente(c, s)), total, page, pageSize })
  }
  if (method === "POST") {
    const d = body as Partial<DCliente>
    if (!d.firstName?.trim()) return err("firstName requerido")
    const cliente = s.addCliente({
      firstName: d.firstName.trim(),
      lastName: d.lastName ?? null,
      phone: d.phone ?? null,
      email: d.email ?? null,
      dni: d.dni ?? null,
      active: true,
    })
    return json(cliente, 201)
  }
  return err("Método no permitido", 405)
}

export function handleClienteId(url: URL, method: string, body: unknown, s: Store, id: string): Response {
  const client = s.clientes.find(c => c.id === id)
  if (!client) return err("Cliente no encontrado", 404)
  if (method === "GET") {
    const vehicles = s.vehiculos.filter(v => v.clientId === id)
    const sales = s.ventas
      .filter(v => v.clientId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
    return json({ ...client, vehicles, sales })
  }
  if (method === "PATCH") {
    const d = body as Partial<DCliente>
    if (d.firstName !== undefined && !d.firstName?.trim()) return err("firstName requerido")
    const updated = s.updateCliente(id, d)
    return json(updated)
  }
  if (method === "DELETE") {
    s.deactivateCliente(id)
    return json({ success: true })
  }
  return err("Método no permitido", 405)
}

// ─── Vehiculos ────────────────────────────────────────────────────────────────

function joinVehiculo(v: DVehiculo, s: Store) {
  return {
    ...v,
    client: s.clientes.find(c => c.id === v.clientId) ?? null,
    _count: { services: s.servicios.filter(sv => sv.vehicleId === v.id).length },
  }
}

export function handleVehiculos(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") {
    const search = url.searchParams.get("search") ?? ""
    const clientId = url.searchParams.get("clientId")
    const page = parseIntParam(url, "page", 1)
    const pageSize = parseIntParam(url, "pageSize", 10)

    let vehicles = s.vehiculos
    if (clientId) vehicles = vehicles.filter(v => v.clientId === clientId)
    if (search) vehicles = vehicles.filter(v =>
      matchStr(v.plate, search) || matchStr(v.brand, search) || matchStr(v.model, search)
    )
    vehicles = vehicles.sort((a, b) => a.plate.localeCompare(b.plate))
    const total = vehicles.length
    const paginated = vehicles.slice((page - 1) * pageSize, page * pageSize)
    return json({ vehicles: paginated.map(v => joinVehiculo(v, s)), total, page, pageSize })
  }
  if (method === "POST") {
    const d = body as Partial<DVehiculo>
    if (!d.plate?.trim()) return err("plate requerido")
    if (!d.clientId) return err("clientId requerido")
    if (!s.clientes.find(c => c.id === d.clientId && c.active)) return err("Cliente no encontrado", 404)
    if (s.vehiculos.find(v => v.plate.toLowerCase() === d.plate!.toLowerCase()))
      return err("Ya existe un vehículo con esa patente", 409)
    const v = s.addVehiculo({
      plate: d.plate.trim().toUpperCase(),
      brand: d.brand ?? "",
      model: d.model ?? "",
      year: d.year ?? new Date().getFullYear(),
      engine: d.engine ?? "",
      clientId: d.clientId,
    })
    return json(joinVehiculo(v, useDemoStore.getState()), 201)
  }
  return err("Método no permitido", 405)
}

export function handleVehiculoId(url: URL, method: string, body: unknown, s: Store, id: string): Response {
  const vehicle = s.vehiculos.find(v => v.id === id)
  if (!vehicle) return err("Vehículo no encontrado", 404)
  if (method === "GET") {
    const client = s.clientes.find(c => c.id === vehicle.clientId) ?? null
    const services = s.servicios
      .filter(sv => sv.vehicleId === id)
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
    return json({ ...vehicle, client, services })
  }
  if (method === "PATCH") {
    const d = body as Partial<DVehiculo>
    if (d.plate && s.vehiculos.find(v => v.id !== id && v.plate.toLowerCase() === d.plate!.toLowerCase()))
      return err("Ya existe un vehículo con esa patente", 409)
    const updated = s.updateVehiculo(id, d)
    return json(joinVehiculo(updated, useDemoStore.getState()))
  }
  return err("Método no permitido", 405)
}

// ─── Servicios ────────────────────────────────────────────────────────────────

function joinServicio(sv: DServicio, s: Store) {
  const vehicle = sv.vehicleId ? s.vehiculos.find(v => v.id === sv.vehicleId) ?? null : null
  const client = vehicle ? s.clientes.find(c => c.id === vehicle.clientId) ?? null : null
  const products = s.servicioProductos
    .filter(sp => sp.serviceId === sv.id)
    .map(sp => ({
      ...sp,
      product: s.productos.find(p => p.id === sp.productId) ?? null,
    }))
  return {
    ...sv,
    vehicle: vehicle ? { ...vehicle, client } : null,
    products,
  }
}

export function handleServicios(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") {
    const search = url.searchParams.get("search") ?? ""
    const page = parseIntParam(url, "page", 1)
    const pageSize = parseIntParam(url, "pageSize", 10)

    let services = [...s.servicios].sort(
      (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
    )
    if (search) {
      services = services.filter(sv => {
        const v = sv.vehicleId ? s.vehiculos.find(vv => vv.id === sv.vehicleId) : null
        const c = v ? s.clientes.find(cc => cc.id === v.clientId) : null
        return matchStr(v?.plate, search) || matchStr(c?.firstName, search) || matchStr(c?.lastName, search)
      })
    }
    const total = services.length
    const paginated = services.slice((page - 1) * pageSize, page * pageSize)
    return json({ services: paginated.map(sv => joinServicio(sv, s)), total, page, pageSize })
  }
  if (method === "POST") {
    const d = body as {
      vehicleId?: string | null
      mileage?: number | null
      nextServiceKm?: number | null
      serviceDate?: string
      nextServiceDate?: string | null
      amount: number
      notes?: string | null
      products?: { productId: string; quantity: number; price: number }[]
    }
    if (d.vehicleId && !s.vehiculos.find(v => v.id === d.vehicleId))
      return err("Vehículo no encontrado", 404)

    const products = d.products ?? []
    for (const p of products) {
      const prod = s.productos.find(pr => pr.id === p.productId && pr.active)
      if (!prod) return err(`Producto ${p.productId} no encontrado`, 404)
      if (prod.stock - p.quantity < 0) return err(`Stock insuficiente para "${prod.name}"`, 409)
    }

    let turnoId: string | null = null
    if (d.vehicleId || products.length > 0) {
      const turno = s.getOrCreateTurno()
      turnoId = turno.id
    }

    const { servicio, servicioProductos } = s.addServicio({
      vehicleId: d.vehicleId ?? null,
      mileage: d.mileage ?? null,
      nextServiceKm: d.nextServiceKm ?? null,
      serviceDate: d.serviceDate ? new Date(d.serviceDate) : new Date(),
      nextServiceDate: d.nextServiceDate ? new Date(d.nextServiceDate) : null,
      amount: d.amount,
      notes: d.notes ?? null,
      turnoId,
      products,
    })
    return json(joinServicio(servicio, useDemoStore.getState()), 201)
  }
  return err("Método no permitido", 405)
}

export function handleServicioId(url: URL, method: string, body: unknown, s: Store, id: string): Response {
  const servicio = s.servicios.find(sv => sv.id === id)
  if (!servicio) return err("Servicio no encontrado", 404)
  if (method === "GET") return json(joinServicio(servicio, s))
  return err("Método no permitido", 405)
}

export function handleServiciosConfig(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") return json(s.configServicio)
  if (method === "PUT" || method === "PATCH") {
    const updated = s.updateConfigServicio(body as Partial<typeof s.configServicio>)
    return json(updated)
  }
  return err("Método no permitido", 405)
}

// ─── Ventas ───────────────────────────────────────────────────────────────────

function joinVenta(v: DVenta, s: Store) {
  return {
    ...v,
    client: v.clientId ? s.clientes.find(c => c.id === v.clientId) ?? null : null,
    items: s.detallesVenta
      .filter(d => d.saleId === v.id)
      .map(d => ({
        ...d,
        product: s.productos.find(p => p.id === d.productId) ?? null,
      })),
  }
}

export function handleVentas(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") {
    const today = new Date().toISOString().split("T")[0]
    const dateStr = url.searchParams.get("date") ?? today
    const page = parseIntParam(url, "page", 1)
    const pageSize = parseIntParam(url, "pageSize", 15)
    const targetDate = new Date(`${dateStr}T00:00:00`)

    let sales = s.ventas.filter(v => isSameDay(new Date(v.createdAt), targetDate))
    sales = sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = sales.length
    const completedSales = sales.filter(v => v.status === "completed")
    const totalDia = completedSales.reduce((acc, v) => acc + v.total, 0)
    const cancelledCount = sales.filter(v => v.status === "cancelled").length
    const paginated = sales.slice((page - 1) * pageSize, page * pageSize)

    return json({
      sales: paginated.map(v => joinVenta(v, s)),
      total, totalDia, cancelledCount, page, pageSize,
    })
  }
  if (method === "POST") {
    const d = body as {
      clientId?: string | null
      discount?: number
      items: { productId: string; quantity: number; price: number }[]
    }
    const items = d.items ?? []
    if (items.length === 0) return err("Se requiere al menos un ítem")

    for (const i of items) {
      if (i.quantity < 1) return err("Cantidad mínima: 1")
      const prod = s.productos.find(p => p.id === i.productId && p.active)
      if (!prod) return err(`Producto ${i.productId} no encontrado`, 404)
      if (prod.stock - i.quantity < 0) return err(`Stock insuficiente para "${prod.name}"`, 409)
    }

    const turno = s.getOrCreateTurno()
    const { venta, detalles } = s.addVenta({
      clientId: d.clientId ?? null,
      turnoId: turno.id,
      discount: d.discount ?? 0,
      items,
    })
    return json(joinVenta(venta, useDemoStore.getState()), 201)
  }
  return err("Método no permitido", 405)
}

export function handleVentaId(url: URL, method: string, body: unknown, s: Store, id: string): Response {
  const venta = s.ventas.find(v => v.id === id)
  if (!venta) return err("Venta no encontrada", 404)
  if (method === "GET") return json(joinVenta(venta, s))
  if (method === "PATCH") {
    const d = body as { status?: string }
    if (d.status === "cancelled") {
      if (venta.status === "cancelled") return err("La venta ya está anulada", 409)
      const updated = s.cancelVenta(id)
      return json(joinVenta(updated, useDemoStore.getState()))
    }
    return err("Operación no soportada", 400)
  }
  return err("Método no permitido", 405)
}

// ─── Lava Auto ────────────────────────────────────────────────────────────────

function joinSesion(ses: DSesion, s: Store) {
  return {
    ...ses,
    vehicle: ses.vehicleId ? s.vehiculos.find(v => v.id === ses.vehicleId) ?? null : null,
    turno: ses.turnoId ? s.turnos.find(t => t.id === ses.turnoId) ?? null : null,
    products: s.sesionProductos
      .filter(sp => sp.sessionId === ses.id)
      .map(sp => ({
        ...sp,
        product: s.productos.find(p => p.id === sp.productId) ?? null,
      })),
    _count: {
      products: s.sesionProductos.filter(sp => sp.sessionId === ses.id).length,
    },
  }
}

export function handleLavaAuto(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") {
    const today = new Date().toISOString().split("T")[0]
    const dateStr = url.searchParams.get("date") ?? today
    const page = parseIntParam(url, "page", 1)
    const pageSize = parseIntParam(url, "pageSize", 20)
    const targetDate = new Date(`${dateStr}T00:00:00`)

    let sessions = s.sesiones.filter(ses => isSameDay(new Date(ses.sessionDate), targetDate))
    sessions = sessions.sort(
      (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    )

    // today stats
    const todayDate = new Date()
    const todaySessions = s.sesiones.filter(ses => isSameDay(new Date(ses.sessionDate), todayDate))
    const todayCount = todaySessions.length
    const todayTotal = todaySessions.reduce((acc, ses) => acc + ses.amount, 0)
    const totalCount = s.sesiones.length

    // daily product consumption (today)
    const todayProductUsage: Record<string, number> = {}
    for (const ses of todaySessions) {
      for (const sp of s.sesionProductos.filter(sp => sp.sessionId === ses.id)) {
        todayProductUsage[sp.productId] = (todayProductUsage[sp.productId] ?? 0) + sp.quantity
      }
    }
    const dailyProducts = Object.entries(todayProductUsage).map(([productId, qty]) => ({
      productId,
      _sum: { quantity: qty },
    }))

    const total = sessions.length
    const paginated = sessions.slice((page - 1) * pageSize, page * pageSize)

    return json({
      sessions: paginated.map(ses => joinSesion(ses, s)),
      total, page, pageSize,
      todayCount, todayTotal, totalCount, dailyProducts,
    })
  }
  if (method === "POST") {
    const d = body as {
      plate?: string | null
      vehicleId?: string | null
      washType: string
      amount: number
      notes?: string | null
      products?: { productId: string; quantity: number }[]
    }
    if (d.vehicleId && !s.vehiculos.find(v => v.id === d.vehicleId))
      return err("Vehículo no encontrado", 404)

    const products = d.products ?? []
    for (const p of products) {
      const prod = s.productos.find(pr => pr.id === p.productId && pr.active)
      if (!prod) return err(`Producto ${p.productId} no encontrado`, 404)
      if (prod.stock - p.quantity < 0) return err(`Stock insuficiente para "${prod.name}"`, 409)
    }

    const turno = s.getOrCreateTurno()
    const { sesion } = s.addSesion({
      plate: d.plate ?? null,
      vehicleId: d.vehicleId ?? null,
      washType: d.washType,
      amount: d.amount,
      notes: d.notes ?? null,
      turnoId: turno.id,
      products,
    })
    return json(joinSesion(sesion, useDemoStore.getState()), 201)
  }
  return err("Método no permitido", 405)
}

export function handleSesionId(url: URL, method: string, body: unknown, s: Store, id: string): Response {
  const sesion = s.sesiones.find(ses => ses.id === id)
  if (!sesion) return err("Sesión no encontrada", 404)
  if (method === "GET") return json(joinSesion(sesion, s))
  return err("Método no permitido", 405)
}

export function handleLavaAutoConfig(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") return json(s.configLavaAuto)
  if (method === "PUT" || method === "PATCH") {
    const updated = s.updateConfigLavaAuto(body as Partial<typeof s.configLavaAuto>)
    return json(updated)
  }
  return err("Método no permitido", 405)
}

export function handleTurno(url: URL, method: string, body: unknown, s: Store): Response {
  const withCount = (t: DTurno) => ({
    ...t,
    _count: { sessions: s.sesiones.filter(se => se.turnoId === t.id).length },
  })

  if (method === "GET") {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const turno = s.turnos.find(t => {
      const d = new Date(t.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })
    return json(turno ? withCount(turno) : null)
  }
  if (method === "POST") {
    const turno = s.getOrCreateTurno()
    return json(withCount(turno), 201)
  }
  if (method === "PATCH") {
    const d = body as { id?: string; action?: string }
    const id = d.id
    if (!id) return err("id requerido")
    const turno = s.turnos.find(t => t.id === id)
    if (!turno) return err("Turno no encontrado", 404)
    const updated = d.action === "reopen" ? s.reopenTurno(id) : s.closeTurno(id)
    return json(withCount(updated))
  }
  return err("Método no permitido", 405)
}

// ─── Proveedores ──────────────────────────────────────────────────────────────

function joinProveedor(p: DProveedor, s: Store) {
  return {
    ...p,
    productLinks: s.proveedorProductos
      .filter(pp => pp.supplierId === p.id)
      .map(pp => ({
        ...pp,
        product: s.productos.find(pr => pr.id === pp.productId) ?? null,
      })),
    purchases: s.compras
      .filter(c => c.supplierId === p.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    _count: {
      productLinks: s.proveedorProductos.filter(pp => pp.supplierId === p.id).length,
      purchases: s.compras.filter(c => c.supplierId === p.id).length,
    },
  }
}

export function handleProveedores(url: URL, method: string, body: unknown, s: Store): Response {
  if (method === "GET") {
    const search = url.searchParams.get("search") ?? ""
    let suppliers = s.proveedores.filter(p => p.active)
    if (search) suppliers = suppliers.filter(p =>
      matchStr(p.name, search) || matchStr(p.contactName, search)
    )
    suppliers = suppliers.sort((a, b) => a.name.localeCompare(b.name))
    return json(suppliers.map(p => joinProveedor(p, s)))
  }
  if (method === "POST") {
    const d = body as Partial<DProveedor>
    if (!d.name?.trim()) return err("name requerido")
    const proveedor = s.addProveedor({
      name: d.name.trim(),
      contactName: d.contactName ?? null,
      phone: d.phone ?? null,
      email: d.email ?? null,
      address: d.address ?? null,
      active: true,
    })
    return json(proveedor, 201)
  }
  return err("Método no permitido", 405)
}

export function handleProveedorId(url: URL, method: string, body: unknown, s: Store, id: string): Response {
  const proveedor = s.proveedores.find(p => p.id === id)
  if (!proveedor) return err("Proveedor no encontrado", 404)
  if (method === "GET") return json(joinProveedor(proveedor, s))
  if (method === "PATCH") {
    const d = body as Partial<DProveedor>
    const updated = s.updateProveedor(id, d)
    return json(updated)
  }
  if (method === "DELETE") {
    s.deactivateProveedor(id)
    return json({ success: true })
  }
  return err("Método no permitido", 405)
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function handleAdminRol(url: URL, method: string, body: unknown): Response {
  // No-op in demo — always succeeds
  const parts = url.pathname.split("/")
  const id = parts[parts.indexOf("usuarios") + 1]
  const { role } = body as { role: string }
  return json({ id, role })
}
