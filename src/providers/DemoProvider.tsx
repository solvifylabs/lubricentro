"use client"

import { useEffect } from "react"
import { useDemoStore } from "@/lib/demo/store"
import {
  handleCategorias,
  handleMarcas,
  handleMovimientos,
  handleStock,
  handleStockId,
  handleClientes,
  handleClienteId,
  handleVehiculos,
  handleVehiculoId,
  handleServicios,
  handleServicioId,
  handleServiciosConfig,
  handleVentas,
  handleVentaId,
  handleLavaAuto,
  handleSesionId,
  handleLavaAutoConfig,
  handleTurno,
  handleProveedores,
  handleProveedorId,
  handleAdminRol,
} from "@/lib/demo/handlers"

type RouteHandler = (
  url: URL,
  method: string,
  body: unknown,
  store: ReturnType<typeof useDemoStore.getState>,
  id?: string
) => Response

type Route = {
  pattern: RegExp
  methods: string[]
  handler: RouteHandler
}

const ROUTES: Route[] = [
  // Stock sub-routes first (more specific)
  { pattern: /^\/api\/stock\/categorias$/, methods: ["GET", "POST", "PATCH"], handler: (u, m, b, s) => handleCategorias(u, m, b, s) },
  { pattern: /^\/api\/stock\/marcas$/, methods: ["GET", "POST"], handler: (u, m, b, s) => handleMarcas(u, m, b, s) },
  { pattern: /^\/api\/stock\/movimientos/, methods: ["GET", "POST"], handler: (u, m, b, s) => handleMovimientos(u, m, b, s) },
  { pattern: /^\/api\/stock\/([^/]+)$/, methods: ["GET", "PATCH", "DELETE"], handler: (u, m, b, s, id) => handleStockId(u, m, b, s, id!) },
  { pattern: /^\/api\/stock$/, methods: ["GET", "POST"], handler: (u, m, b, s) => handleStock(u, m, b, s) },
  // Clientes
  { pattern: /^\/api\/clientes\/([^/]+)$/, methods: ["GET", "PATCH", "DELETE"], handler: (u, m, b, s, id) => handleClienteId(u, m, b, s, id!) },
  { pattern: /^\/api\/clientes$/, methods: ["GET", "POST"], handler: (u, m, b, s) => handleClientes(u, m, b, s) },
  // Vehiculos
  { pattern: /^\/api\/vehiculos\/([^/]+)$/, methods: ["GET", "PATCH", "DELETE"], handler: (u, m, b, s, id) => handleVehiculoId(u, m, b, s, id!) },
  { pattern: /^\/api\/vehiculos$/, methods: ["GET", "POST"], handler: (u, m, b, s) => handleVehiculos(u, m, b, s) },
  // Servicios sub-routes first
  { pattern: /^\/api\/servicios\/config$/, methods: ["GET", "PUT", "PATCH"], handler: (u, m, b, s) => handleServiciosConfig(u, m, b, s) },
  { pattern: /^\/api\/servicios\/([^/]+)$/, methods: ["GET"], handler: (u, m, b, s, id) => handleServicioId(u, m, b, s, id!) },
  { pattern: /^\/api\/servicios$/, methods: ["GET", "POST"], handler: (u, m, b, s) => handleServicios(u, m, b, s) },
  // Ventas
  { pattern: /^\/api\/ventas\/([^/]+)$/, methods: ["GET", "PATCH"], handler: (u, m, b, s, id) => handleVentaId(u, m, b, s, id!) },
  { pattern: /^\/api\/ventas$/, methods: ["GET", "POST"], handler: (u, m, b, s) => handleVentas(u, m, b, s) },
  // Lava auto sub-routes first
  { pattern: /^\/api\/lava-auto\/config$/, methods: ["GET", "PUT", "PATCH"], handler: (u, m, b, s) => handleLavaAutoConfig(u, m, b, s) },
  { pattern: /^\/api\/lava-auto\/turno$/, methods: ["GET", "POST", "PATCH"], handler: (u, m, b, s) => handleTurno(u, m, b, s) },
  { pattern: /^\/api\/lava-auto\/([^/]+)$/, methods: ["GET"], handler: (u, m, b, s, id) => handleSesionId(u, m, b, s, id!) },
  { pattern: /^\/api\/lava-auto$/, methods: ["GET", "POST"], handler: (u, m, b, s) => handleLavaAuto(u, m, b, s) },
  // Proveedores
  { pattern: /^\/api\/proveedores\/([^/]+)$/, methods: ["GET", "PATCH", "DELETE"], handler: (u, m, b, s, id) => handleProveedorId(u, m, b, s, id!) },
  { pattern: /^\/api\/proveedores$/, methods: ["GET", "POST"], handler: (u, m, b, s) => handleProveedores(u, m, b, s) },
  // Admin
  { pattern: /^\/api\/admin\/usuarios\/[^/]+\/rol$/, methods: ["PATCH"], handler: (u, m, b) => handleAdminRol(u, m, b) },
]

async function demoFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response | null> {
  const href = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url
  const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  const pathname = url.pathname
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase()

  if (!pathname.startsWith("/api/")) return null

  // Parse body
  let body: unknown = undefined
  if (init?.body) {
    try {
      body = JSON.parse(init.body as string)
    } catch {
      body = init.body
    }
  } else if (input instanceof Request && input.body) {
    try {
      body = await input.clone().json()
    } catch {
      body = undefined
    }
  }

  const store = useDemoStore.getState()

  for (const route of ROUTES) {
    const match = pathname.match(route.pattern)
    if (!match) continue
    if (!route.methods.includes(method)) continue
    const id = match[1] // captured group (if any)
    return route.handler(url, method, body, store, id)
  }

  return null
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const original = window.fetch.bind(window)

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const result = await demoFetch(input, init)
        if (result !== null) return result
      } catch (e) {
        console.error("[DemoProvider] handler error", e)
      }
      return original(input, init)
    }

    return () => {
      window.fetch = original
    }
  }, [])

  return <>{children}</>
}
