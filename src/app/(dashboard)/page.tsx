export const dynamic = 'force-dynamic'

import { PageHeader } from "@/components/layout/PageHeader"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { TurnoWidget } from "@/components/lava-auto/TurnoWidget"
import prisma from "@/lib/prisma"
import { AlertTriangle, Wrench, ShoppingCart, Plus, Receipt } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import type { Producto, Marca, Categoria, Servicio, Vehiculo, Cliente, Venta } from "@/types"

async function getStats() {
  const [totalProducts, lowStock, totalClients, todayServices, todaySales] =
    await Promise.all([
      prisma.producto.count({ where: { active: true } }),
      prisma.producto.count({ where: { active: true, stock: { lte: 5 } } }),
      prisma.cliente.count({ where: { active: true } }),
      prisma.servicio.count({
        where: {
          serviceDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.venta.count({
        where: {
          status: "completed",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ])

  return { totalProducts, lowStock, totalClients, todayServices, todaySales }
}

async function getLowStockProducts() {
  return prisma.producto.findMany({
    where: { active: true, stock: { lte: 5 } },
    include: { category: true, brand: true },
    orderBy: { stock: "asc" },
    take: 5,
  })
}

async function getRecentServices() {
  return prisma.servicio.findMany({
    include: { vehicle: { include: { client: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  })
}

async function getRecentSales() {
  return prisma.venta.findMany({
    where: { status: "completed" },
    include: { client: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
}

export default async function DashboardPage() {
  const [stats, lowStockItems, recentServices, recentSales] = await Promise.all([
    getStats(),
    getLowStockProducts(),
    getRecentServices(),
    getRecentSales(),
  ])

  const summaryCards = [
    {
      title: "Productos activos",
      value: stats.totalProducts,
      icon: "Package" as const,
      href: "/stock",
      gradient: "bg-linear-to-br from-yellow-400 to-yellow-500",
      shadow: "shadow-lg shadow-yellow-400/30",
      trend: "Total en inventario",
      textDark: true,
    },
    {
      title: "Clientes",
      value: stats.totalClients,
      icon: "Users" as const,
      href: "/clientes",
      gradient: "bg-linear-to-br from-zinc-800 to-zinc-950",
      shadow: "shadow-lg shadow-black/40",
      trend: "Clientes activos",
    },
    {
      title: "Servicios hoy",
      value: stats.todayServices,
      icon: "Wrench" as const,
      href: "/servicios",
      gradient: "bg-linear-to-br from-amber-400 to-yellow-500",
      shadow: "shadow-lg shadow-amber-400/30",
      trend: "Realizados hoy",
      textDark: true,
    },
    {
      title: "Ventas hoy",
      value: stats.todaySales,
      icon: "ShoppingCart" as const,
      href: "/ventas",
      gradient: "bg-linear-to-br from-gray-800 to-gray-950",
      shadow: "shadow-lg shadow-black/40",
      trend: "Completadas hoy",
    },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={new Date().toLocaleDateString("es-AR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      />

      <StatsCards cards={summaryCards} />

      <div className="mb-6">
        <TurnoWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock alert */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-sm font-semibold">Stock bajo</h2>
            {lowStockItems.length > 0 && (
              <span className="ml-auto text-xs font-semibold bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                {lowStockItems.length}
              </span>
            )}
          </div>
          <div className="p-2">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-4">
                No hay productos con stock bajo.
              </p>
            ) : (
              lowStockItems.map((p: Producto & { category: Categoria; brand: Marca | null }) => (
                <Link
                  key={p.id}
                  href={`/stock/${p.id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.brand?.name ?? "Sin marca"} · {p.category.name}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-destructive tabular-nums">
                    {p.stock} {p.unit}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent services */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-400/10">
              <Wrench className="h-4 w-4 text-yellow-500" />
            </div>
            <h2 className="text-sm font-semibold">Últimos servicios</h2>
          </div>
          <div className="p-2">
            {recentServices.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-4">
                No hay servicios registrados.
              </p>
            ) : (
              recentServices.map((s: Servicio & { vehicle: (Vehiculo & { client: Cliente }) | null }) => (
                <Link
                  key={s.id}
                  href={`/servicios/${s.id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium leading-tight">
                      {s.vehicle ? `${s.vehicle.plate} — ${s.vehicle.brand} ${s.vehicle.model}` : "Servicio anónimo"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.vehicle?.client
                        ? `${s.vehicle.client.firstName} ${s.vehicle.client.lastName ?? ""}`
                        : "Sin cliente"}{" "}
                      · {new Date(s.serviceDate).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    ${Number(s.amount).toLocaleString("es-AR")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent sales */}
        <div className="lg:col-span-2 rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-400/10">
              <Receipt className="h-4 w-4 text-yellow-500" />
            </div>
            <h2 className="text-sm font-semibold">Últimas ventas</h2>
            <Link
              href="/ventas"
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          <div className="p-2">
            {recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-4">
                No hay ventas registradas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {(recentSales as (Venta & { client: Cliente | null })[]).map((v) => (
                  <Link
                    key={v.id}
                    href={`/ventas/${v.id}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">
                        {v.client
                          ? `${v.client.firstName} ${v.client.lastName ?? ""}`.trim()
                          : "Cliente anónimo"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(v.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="ml-3 shrink-0 text-sm font-semibold tabular-nums text-yellow-600 dark:text-yellow-400">
                      ${Number(v.total).toLocaleString("es-AR")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick new sale CTA */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden bg-yellow-400 p-px shadow-lg shadow-yellow-400/20">
          <div className="rounded-[calc(1rem-1px)] bg-card px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-400 shadow-md shadow-yellow-400/25">
                <ShoppingCart className="h-5 w-5 text-gray-950" />
              </div>
              <div>
                <p className="font-semibold">Registrar nueva venta</p>
                <p className="text-sm text-muted-foreground">Seleccioná cliente, productos y confirmá</p>
              </div>
            </div>
            <Button
              asChild
              className="shrink-0 gap-2 bg-yellow-400 text-gray-950 shadow-md shadow-yellow-400/25 hover:bg-yellow-300 transition-colors"
            >
              <Link href="/ventas/nueva">
                <Plus className="h-4 w-4" />
                Nueva venta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
