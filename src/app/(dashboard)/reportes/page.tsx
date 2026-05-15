"use client"

import { Suspense } from "react"
import { useDemoStore } from "@/lib/demo/store"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { PeriodSelector } from "@/components/reportes/PeriodSelector"
import { ReporteKPICards } from "@/components/reportes/ReporteKPICards"
import { ReporteVentasChart } from "@/components/reportes/ReporteVentasChart"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

function getDateRange(period: string, from?: string, to?: string) {
  const now = new Date()
  if (period === "week") {
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }
  if (period === "year") {
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
    }
  }
  if (period === "custom" && from && to) {
    return {
      start: new Date(`${from}T00:00:00`),
      end: new Date(`${to}T23:59:59`),
    }
  }
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
  }
}

function periodLabel(period: string, start: Date, end: Date) {
  if (period === "week") return "Últimos 7 días"
  if (period === "month") return `Mes: ${format(start, "MMMM yyyy", { locale: es })}`
  if (period === "year") return `Año ${start.getFullYear()}`
  return `${format(start, "d MMM yyyy", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`
}

function ReportesPageInner() {
  const searchParams = useSearchParams()
  const period = searchParams.get("period") ?? "month"
  const from = searchParams.get("from") ?? undefined
  const to = searchParams.get("to") ?? undefined

  const { start, end } = getDateRange(period, from, to)
  const store = useDemoStore()

  const inRange = (date: Date | string) => {
    const d = new Date(date)
    return d >= start && d <= end
  }

  const completedVentas = store.ventas.filter(
    (v) => v.status === "completed" && inRange(v.createdAt)
  )
  const ventasTotal = completedVentas.reduce((acc, v) => acc + Number(v.total), 0)

  const serviciosInRange = store.servicios.filter((s) => inRange(s.serviceDate))
  const serviciosTotal = serviciosInRange.reduce((acc, s) => acc + Number(s.amount), 0)
  const ingresoTotal = ventasTotal + serviciosTotal

  const lowStock = store.productos
    .filter((p) => p.active && p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock)
    .map((p) => ({
      ...p,
      category: store.categorias.find((c) => c.id === p.categoryId)!,
    }))

  // Top productos: sum qty sold per product in range
  const ventaIds = new Set(completedVentas.map((v) => v.id))
  const detallesInRange = store.detallesVenta.filter((d) => ventaIds.has(d.saleId))
  const productQtyMap = new Map<string, number>()
  for (const d of detallesInRange) {
    productQtyMap.set(d.productId, (productQtyMap.get(d.productId) ?? 0) + d.quantity)
  }
  const topProducts = [...productQtyMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([productId, quantity]) => ({
      name: store.productos.find((p) => p.id === productId)?.name ?? "—",
      quantity,
    }))

  // Top clientes: sum total per client in range
  const clientTotalMap = new Map<string, { total: number; count: number }>()
  for (const v of completedVentas) {
    if (!v.clientId) continue
    const prev = clientTotalMap.get(v.clientId) ?? { total: 0, count: 0 }
    clientTotalMap.set(v.clientId, { total: prev.total + Number(v.total), count: prev.count + 1 })
  }
  const topClients = [...clientTotalMap.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8)
    .map(([clientId, data]) => {
      const c = store.clientes.find((cl) => cl.id === clientId)
      return {
        name: c ? `${c.firstName} ${c.lastName ?? ""}`.trim() : "Anónimo",
        total: data.total,
        count: data.count,
      }
    })

  // Chart data
  const chartData: { label: string; total: number; count: number }[] = []
  if (period === "year") {
    const monthMap = new Map<string, { total: number; count: number }>()
    for (const v of completedVentas) {
      const d = new Date(v.createdAt)
      const label = format(d, "MMM", { locale: es })
      const prev = monthMap.get(label) ?? { total: 0, count: 0 }
      monthMap.set(label, { total: prev.total + Number(v.total), count: prev.count + 1 })
    }
    for (const [label, data] of monthMap) chartData.push({ label, ...data })
  } else {
    const dayMap = new Map<string, { total: number; count: number }>()
    for (const v of completedVentas) {
      const d = new Date(v.createdAt)
      const label = format(d, "dd MMM", { locale: es })
      const prev = dayMap.get(label) ?? { total: 0, count: 0 }
      dayMap.set(label, { total: prev.total + Number(v.total), count: prev.count + 1 })
    }
    for (const [label, data] of dayMap) chartData.push({ label, ...data })
    chartData.sort((a, b) => a.label.localeCompare(b.label))
  }

  const kpiCards = [
    {
      label: "Ventas",
      value: `$${ventasTotal.toLocaleString("es-AR")}`,
      sub: `${completedVentas.length} transacciones`,
      gradient: "bg-linear-to-br from-yellow-400 to-yellow-500",
      shadow: "shadow-lg shadow-yellow-400/30",
      icon: "TrendingUp" as const,
      textDark: true,
    },
    {
      label: "Servicios",
      value: `$${serviciosTotal.toLocaleString("es-AR")}`,
      sub: `${serviciosInRange.length} servicios`,
      gradient: "bg-linear-to-br from-zinc-800 to-zinc-950",
      shadow: "shadow-lg shadow-black/40",
      icon: "Wrench" as const,
    },
    {
      label: "Ingreso total",
      value: `$${ingresoTotal.toLocaleString("es-AR")}`,
      sub: "Ventas + Servicios",
      gradient: "bg-linear-to-br from-amber-400 to-yellow-500",
      shadow: "shadow-lg shadow-amber-400/30",
      icon: "DollarSign" as const,
      textDark: true,
    },
    {
      label: "Stock bajo",
      value: String(lowStock.length),
      sub: "Requieren reposición",
      gradient: "bg-linear-to-br from-rose-500 to-red-600",
      shadow: "shadow-lg shadow-rose-500/30",
      icon: "PackageX" as const,
    },
  ]

  const maxProduct = Math.max(...topProducts.map((p) => p.quantity), 1)
  const maxClient = Math.max(...topClients.map((c) => c.total), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader
          title="Reportes"
          description={periodLabel(period, start, end)}
        />
        <PeriodSelector currentPeriod={period} currentFrom={from} currentTo={to} />
      </div>

      <ReporteKPICards cards={kpiCards} />

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold">Ventas por período</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {period === "year" ? "Agrupado por mes" : "Agrupado por día"}
          </p>
        </div>
        <div className="p-5">
          <ReporteVentasChart data={chartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold">Top productos vendidos</h2>
            <Badge variant="secondary">{topProducts.length}</Badge>
          </div>
          <div className="p-5 space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos en el período.</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-muted-foreground w-4 text-right">{i + 1}</span>
                      <span className="text-sm font-medium truncate max-w-45">{p.name}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-yellow-600 dark:text-yellow-400">
                      {p.quantity} u.
                    </span>
                  </div>
                  <div className="ml-6 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((p.quantity / maxProduct) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold">Mejores clientes</h2>
            <Badge variant="secondary">{topClients.length}</Badge>
          </div>
          <div className="p-5 space-y-4">
            {topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos en el período.</p>
            ) : (
              topClients.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-muted-foreground w-4 text-right">{i + 1}</span>
                      <span className="text-sm font-medium truncate max-w-40">{c.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-yellow-600 dark:text-yellow-400">
                        ${c.total.toLocaleString("es-AR")}
                      </p>
                      <p className="text-xs text-muted-foreground">{c.count} compra{c.count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="ml-6 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((c.total / maxClient) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Productos con stock bajo</h2>
          {lowStock.length > 0 && (
            <Badge variant="destructive">{lowStock.length} productos</Badge>
          )}
        </div>
        <div className="p-2">
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground px-3 py-4">
              Todos los productos tienen stock suficiente.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {lowStock.map((p) => (
                <Link
                  key={p.id}
                  href={`/stock/${p.id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.category.name}</p>
                  </div>
                  <Badge variant="destructive" className="ml-3 shrink-0">
                    {p.stock} {p.unit}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReportesPage() {
  return (
    <Suspense>
      <ReportesPageInner />
    </Suspense>
  )
}
