import { create } from "zustand"
import { createSeedData } from "./seed"

// All monetary fields are plain numbers (Prisma's Decimal replaced with number).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = number

export interface DCategoria { id: string; name: string; createdAt: Date }
export interface DMarca { id: string; name: string; createdAt: Date }
export interface DProducto {
  id: string; name: string; code: string | null
  categoryId: string; brandId: string | null
  buyPrice: N; sellPrice: N
  stock: number; minStock: number; unit: string
  active: boolean; expectedConsumptionPerWash: N | null
  createdAt: Date; updatedAt: Date
}
export interface DMovimiento {
  id: string; productId: string; type: string
  quantity: number; reason: string | null; createdAt: Date
}
export interface DCliente {
  id: string; firstName: string; lastName: string | null
  phone: string | null; email: string | null; dni: string | null
  active: boolean; createdAt: Date; updatedAt: Date
}
export interface DVehiculo {
  id: string; plate: string; brand: string; model: string
  year: number; engine: string; clientId: string
  createdAt: Date; updatedAt: Date
}
export interface DServicio {
  id: string; vehicleId: string | null
  mileage: number | null; nextServiceKm: number | null
  serviceDate: Date; nextServiceDate: Date | null
  amount: N; notes: string | null; turnoId: string | null; createdAt: Date
}
export interface DServicioProducto {
  id: string; serviceId: string; productId: string; quantity: number; price: N
}
export interface DVenta {
  id: string; clientId: string | null
  total: N; discount: N; status: string
  turnoId: string | null; createdAt: Date
}
export interface DDetalleVenta {
  id: string; saleId: string; productId: string; quantity: number; price: N
}
export interface DProveedor {
  id: string; name: string; contactName: string | null
  phone: string | null; email: string | null; address: string | null
  active: boolean; createdAt: Date; updatedAt: Date
}
export interface DProveedorProducto {
  id: string; supplierId: string; productId: string
}
export interface DCompra {
  id: string; supplierId: string; total: N; notes: string | null; createdAt: Date
}
export interface DTurno {
  id: string; date: Date; startedAt: Date; endedAt: Date | null
  notes: string | null; createdAt: Date
}
export interface DSesion {
  id: string; plate: string | null; vehicleId: string | null
  washType: string; amount: N; notes: string | null
  sessionDate: Date; turnoId: string | null; createdAt: Date
}
export interface DSesionProducto {
  id: string; sessionId: string; productId: string; quantity: number
}
export interface DConfigLavaAuto {
  id: string; priceInterior: N; priceExterior: N; priceIntegro: N; updatedAt: Date
}
export interface DConfigServicio {
  id: string; servicePrice: N; updatedAt: Date
}

interface DemoStore {
  categorias: DCategoria[]
  marcas: DMarca[]
  productos: DProducto[]
  movimientos: DMovimiento[]
  clientes: DCliente[]
  vehiculos: DVehiculo[]
  servicios: DServicio[]
  servicioProductos: DServicioProducto[]
  ventas: DVenta[]
  detallesVenta: DDetalleVenta[]
  proveedores: DProveedor[]
  proveedorProductos: DProveedorProducto[]
  compras: DCompra[]
  turnos: DTurno[]
  sesiones: DSesion[]
  sesionProductos: DSesionProducto[]
  configLavaAuto: DConfigLavaAuto
  configServicio: DConfigServicio

  // ── Categoria / Marca ─────────────────────────────────────────────────
  addCategoria: (name: string) => DCategoria
  addMarca: (name: string) => DMarca

  // ── Producto ──────────────────────────────────────────────────────────
  addProducto: (data: Omit<DProducto, "id" | "createdAt" | "updatedAt">) => DProducto
  updateProducto: (id: string, data: Partial<DProducto>) => DProducto
  deactivateProducto: (id: string) => void

  // ── Stock (single mutation point) ────────────────────────────────────
  adjustStock: (productId: string, delta: number, type: string, reason: string) => DMovimiento

  // ── Cliente ───────────────────────────────────────────────────────────
  addCliente: (data: Omit<DCliente, "id" | "createdAt" | "updatedAt">) => DCliente
  updateCliente: (id: string, data: Partial<DCliente>) => DCliente
  deactivateCliente: (id: string) => void

  // ── Vehiculo ──────────────────────────────────────────────────────────
  addVehiculo: (data: Omit<DVehiculo, "id" | "createdAt" | "updatedAt">) => DVehiculo
  updateVehiculo: (id: string, data: Partial<DVehiculo>) => DVehiculo

  // ── Servicio ──────────────────────────────────────────────────────────
  addServicio: (data: {
    vehicleId: string | null
    mileage: number | null
    nextServiceKm: number | null
    serviceDate: Date
    nextServiceDate: Date | null
    amount: number
    notes: string | null
    turnoId: string | null
    products: { productId: string; quantity: number; price: number }[]
  }) => { servicio: DServicio; servicioProductos: DServicioProducto[] }

  // ── Venta ─────────────────────────────────────────────────────────────
  addVenta: (data: {
    clientId: string | null
    turnoId: string | null
    discount: number
    items: { productId: string; quantity: number; price: number }[]
  }) => { venta: DVenta; detalles: DDetalleVenta[] }
  cancelVenta: (id: string) => DVenta

  // ── Sesion Lava Auto ──────────────────────────────────────────────────
  addSesion: (data: {
    plate: string | null
    vehicleId: string | null
    washType: string
    amount: number
    notes: string | null
    turnoId: string | null
    products: { productId: string; quantity: number }[]
  }) => { sesion: DSesion; sesionProductos: DSesionProducto[] }
  getOrCreateTurno: () => DTurno
  closeTurno: (id: string) => DTurno
  reopenTurno: (id: string) => DTurno

  // ── Proveedor ─────────────────────────────────────────────────────────
  addProveedor: (data: Omit<DProveedor, "id" | "createdAt" | "updatedAt">) => DProveedor
  updateProveedor: (id: string, data: Partial<DProveedor>) => DProveedor
  deactivateProveedor: (id: string) => void
  addProveedorProducto: (supplierId: string, productId: string) => DProveedorProducto
  removeProveedorProducto: (supplierId: string, productId: string) => void

  // ── Config ────────────────────────────────────────────────────────────
  updateConfigLavaAuto: (data: Partial<DConfigLavaAuto>) => DConfigLavaAuto
  updateConfigServicio: (data: Partial<DConfigServicio>) => DConfigServicio
}

function uid() {
  return crypto.randomUUID()
}

const seed = createSeedData()

export const useDemoStore = create<DemoStore>((set, get) => ({
  categorias: seed.categorias as DCategoria[],
  marcas: seed.marcas as DMarca[],
  productos: seed.productos as DProducto[],
  movimientos: seed.movimientos as DMovimiento[],
  clientes: seed.clientes as DCliente[],
  vehiculos: seed.vehiculos as DVehiculo[],
  servicios: seed.servicios as DServicio[],
  servicioProductos: seed.servicioProductos as DServicioProducto[],
  ventas: seed.ventas as DVenta[],
  detallesVenta: seed.detallesVenta as DDetalleVenta[],
  proveedores: seed.proveedores as DProveedor[],
  proveedorProductos: seed.proveedorProductos as DProveedorProducto[],
  compras: seed.compras as DCompra[],
  turnos: seed.turnos as DTurno[],
  sesiones: seed.sesiones as DSesion[],
  sesionProductos: seed.sesionProductos as DSesionProducto[],
  configLavaAuto: seed.configLavaAuto as DConfigLavaAuto,
  configServicio: seed.configServicio as DConfigServicio,

  // ── Categoria / Marca ─────────────────────────────────────────────────
  addCategoria: (name) => {
    const cat: DCategoria = { id: uid(), name, createdAt: new Date() }
    set(s => ({ categorias: [...s.categorias, cat] }))
    return cat
  },
  addMarca: (name) => {
    const marca: DMarca = { id: uid(), name, createdAt: new Date() }
    set(s => ({ marcas: [...s.marcas, marca] }))
    return marca
  },

  // ── Producto ──────────────────────────────────────────────────────────
  addProducto: (data) => {
    const now = new Date()
    const producto: DProducto = { id: uid(), ...data, createdAt: now, updatedAt: now }
    set(s => ({ productos: [...s.productos, producto] }))
    return producto
  },
  updateProducto: (id, data) => {
    let updated!: DProducto
    set(s => ({
      productos: s.productos.map(p => {
        if (p.id !== id) return p
        updated = { ...p, ...data, updatedAt: new Date() }
        return updated
      }),
    }))
    return updated
  },
  deactivateProducto: (id) => {
    set(s => ({
      productos: s.productos.map(p => p.id === id ? { ...p, active: false, updatedAt: new Date() } : p),
    }))
  },

  // ── Stock ─────────────────────────────────────────────────────────────
  adjustStock: (productId, delta, type, reason) => {
    set(s => ({
      productos: s.productos.map(p =>
        p.id === productId ? { ...p, stock: p.stock + delta, updatedAt: new Date() } : p
      ),
    }))
    const mov: DMovimiento = {
      id: uid(), productId, type,
      quantity: Math.abs(delta), reason, createdAt: new Date(),
    }
    set(s => ({ movimientos: [...s.movimientos, mov] }))
    return mov
  },

  // ── Cliente ───────────────────────────────────────────────────────────
  addCliente: (data) => {
    const now = new Date()
    const cliente: DCliente = { id: uid(), ...data, createdAt: now, updatedAt: now }
    set(s => ({ clientes: [...s.clientes, cliente] }))
    return cliente
  },
  updateCliente: (id, data) => {
    let updated!: DCliente
    set(s => ({
      clientes: s.clientes.map(c => {
        if (c.id !== id) return c
        updated = { ...c, ...data, updatedAt: new Date() }
        return updated
      }),
    }))
    return updated
  },
  deactivateCliente: (id) => {
    set(s => ({
      clientes: s.clientes.map(c => c.id === id ? { ...c, active: false, updatedAt: new Date() } : c),
    }))
  },

  // ── Vehiculo ──────────────────────────────────────────────────────────
  addVehiculo: (data) => {
    const now = new Date()
    const vehiculo: DVehiculo = { id: uid(), ...data, createdAt: now, updatedAt: now }
    set(s => ({ vehiculos: [...s.vehiculos, vehiculo] }))
    return vehiculo
  },
  updateVehiculo: (id, data) => {
    let updated!: DVehiculo
    set(s => ({
      vehiculos: s.vehiculos.map(v => {
        if (v.id !== id) return v
        updated = { ...v, ...data, updatedAt: new Date() }
        return updated
      }),
    }))
    return updated
  },

  // ── Servicio ──────────────────────────────────────────────────────────
  addServicio: (data) => {
    const s = get()
    const servicio: DServicio = {
      id: uid(),
      vehicleId: data.vehicleId,
      mileage: data.mileage,
      nextServiceKm: data.nextServiceKm,
      serviceDate: data.serviceDate,
      nextServiceDate: data.nextServiceDate,
      amount: data.amount,
      notes: data.notes,
      turnoId: data.turnoId,
      createdAt: new Date(),
    }
    const sps: DServicioProducto[] = data.products.map(p => ({
      id: uid(), serviceId: servicio.id,
      productId: p.productId, quantity: p.quantity, price: p.price,
    }))
    set(prev => ({
      servicios: [...prev.servicios, servicio],
      servicioProductos: [...prev.servicioProductos, ...sps],
    }))
    for (const p of data.products) {
      s.adjustStock(p.productId, -p.quantity, "exit", `Servicio #${servicio.id.slice(-6)}`)
    }
    return { servicio, servicioProductos: sps }
  },

  // ── Venta ─────────────────────────────────────────────────────────────
  addVenta: (data) => {
    const s = get()
    const total = data.items.reduce((acc, i) => acc + i.quantity * i.price, 0) - data.discount
    const venta: DVenta = {
      id: uid(),
      clientId: data.clientId,
      total,
      discount: data.discount,
      status: "completed",
      turnoId: data.turnoId,
      createdAt: new Date(),
    }
    const detalles: DDetalleVenta[] = data.items.map(i => ({
      id: uid(), saleId: venta.id,
      productId: i.productId, quantity: i.quantity, price: i.price,
    }))
    set(prev => ({
      ventas: [...prev.ventas, venta],
      detallesVenta: [...prev.detallesVenta, ...detalles],
    }))
    for (const i of data.items) {
      s.adjustStock(i.productId, -i.quantity, "exit", `Venta #${venta.id.slice(-6)}`)
    }
    return { venta, detalles }
  },
  cancelVenta: (id) => {
    const s = get()
    const venta = s.ventas.find(v => v.id === id)!
    const detalles = s.detallesVenta.filter(d => d.saleId === id)
    let updated!: DVenta
    set(prev => ({
      ventas: prev.ventas.map(v => {
        if (v.id !== id) return v
        updated = { ...v, status: "cancelled" }
        return updated
      }),
    }))
    for (const d of detalles) {
      s.adjustStock(d.productId, +d.quantity, "entry", `Cancelación Venta #${venta.id.slice(-6)}`)
    }
    return updated
  },

  // ── Sesion Lava Auto ──────────────────────────────────────────────────
  addSesion: (data) => {
    const s = get()
    const sesion: DSesion = {
      id: uid(),
      plate: data.plate,
      vehicleId: data.vehicleId,
      washType: data.washType,
      amount: data.amount,
      notes: data.notes,
      sessionDate: new Date(),
      turnoId: data.turnoId,
      createdAt: new Date(),
    }
    const sps: DSesionProducto[] = data.products.map(p => ({
      id: uid(), sessionId: sesion.id,
      productId: p.productId, quantity: p.quantity,
    }))
    set(prev => ({
      sesiones: [...prev.sesiones, sesion],
      sesionProductos: [...prev.sesionProductos, ...sps],
    }))
    for (const p of data.products) {
      s.adjustStock(p.productId, -p.quantity, "exit", `Lava Auto #${sesion.id.slice(-6)}`)
    }
    return { sesion, sesionProductos: sps }
  },
  getOrCreateTurno: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const existing = get().turnos.find(t => {
      const d = new Date(t.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime() && t.endedAt === null
    })
    if (existing) return existing
    const turno: DTurno = {
      id: uid(), date: today, startedAt: new Date(),
      endedAt: null, notes: null, createdAt: new Date(),
    }
    set(s => ({ turnos: [...s.turnos, turno] }))
    return turno
  },
  closeTurno: (id) => {
    let updated!: DTurno
    set(s => ({
      turnos: s.turnos.map(t => {
        if (t.id !== id) return t
        updated = { ...t, endedAt: new Date() }
        return updated
      }),
    }))
    return updated
  },
  reopenTurno: (id) => {
    let updated!: DTurno
    set(s => ({
      turnos: s.turnos.map(t => {
        if (t.id !== id) return t
        updated = { ...t, endedAt: null }
        return updated
      }),
    }))
    return updated
  },

  // ── Proveedor ─────────────────────────────────────────────────────────
  addProveedor: (data) => {
    const now = new Date()
    const proveedor: DProveedor = { id: uid(), ...data, createdAt: now, updatedAt: now }
    set(s => ({ proveedores: [...s.proveedores, proveedor] }))
    return proveedor
  },
  updateProveedor: (id, data) => {
    let updated!: DProveedor
    set(s => ({
      proveedores: s.proveedores.map(p => {
        if (p.id !== id) return p
        updated = { ...p, ...data, updatedAt: new Date() }
        return updated
      }),
    }))
    return updated
  },
  deactivateProveedor: (id) => {
    set(s => ({
      proveedores: s.proveedores.map(p =>
        p.id === id ? { ...p, active: false, updatedAt: new Date() } : p
      ),
    }))
  },
  addProveedorProducto: (supplierId, productId) => {
    const pp: DProveedorProducto = { id: uid(), supplierId, productId }
    set(s => ({ proveedorProductos: [...s.proveedorProductos, pp] }))
    return pp
  },
  removeProveedorProducto: (supplierId, productId) => {
    set(s => ({
      proveedorProductos: s.proveedorProductos.filter(
        pp => !(pp.supplierId === supplierId && pp.productId === productId)
      ),
    }))
  },

  // ── Config ────────────────────────────────────────────────────────────
  updateConfigLavaAuto: (data) => {
    let updated!: DConfigLavaAuto
    set(s => {
      updated = { ...s.configLavaAuto, ...data, updatedAt: new Date() }
      return { configLavaAuto: updated }
    })
    return updated
  },
  updateConfigServicio: (data) => {
    let updated!: DConfigServicio
    set(s => {
      updated = { ...s.configServicio, ...data, updatedAt: new Date() }
      return { configServicio: updated }
    })
    return updated
  },
}))
