export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/layout/PageHeader"
import { PeriodSelector } from "@/components/reportes/PeriodSelector"
import { ReporteKPICards } from "@/components/reportes/ReporteKPICards"
import { ReporteVentasChart } from "@/components/reportes/ReporteVentasChart"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Producto, Categoria } from "@/types"

// ── Date range helpers ───────────────────────────────────────────────────────

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
  // default: current month
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
  }
}

function periodLabel(period: string, start: Date, end: Date) {
  if (period === "week") return "Últimos 7 días"
  if (period === "month")
    return `Mes: ${format(start, "MMMM yyyy", { locale: es })}`
  if (period === "year") return `Año ${start.getFullYear()}`
  return `${format(start, "d MMM yyyy", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`
}

// ── Data fetching ────────────────────────────────────────────────────────────

async function getReportData(start: Date, end: Date, period: string) {
  const [
    salesAgg,
    servicesAgg,
    topProductsRaw,
    topClientsRaw,
    lowStock,
    chartRaw,
  ] = await Promise.all([
    prisma.venta.aggregate({
      where: { status: "completed", createdAt: { gte: start, lte: end } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.servicio.aggregate({
      where: { serviceDate: { gte: start, lte: end } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.detalleVenta.groupBy({
      by: ["productId"],
      where: { sale: { status: "completed", createdAt: { gte: start, lte: end } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    }),
    prisma.venta.groupBy({
      by: ["clientId"],
      where: {
        status: "completed",
        clientId: { not: null },
        createdAt: { gte: start, lte: end },
      },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: "desc" } },
      take: 8,
    }),
    prisma.producto.findMany({
      where: { active: true, stock: { lte: 5 } },
      include: { category: true },
      orderBy: { stock: "asc" },
    }),
    // Chart data: daily for week/month/custom, monthly for year
    period === "year"
      ? prisma.$queryRaw<{ label: string; total: number; count: number }[]>`
          SELECT
            TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS label,
            COALESCE(SUM(total), 0)::float AS total,
            COUNT(*)::int AS count
          FROM "Venta"
          WHERE status = 'completed'
            AND "createdAt" >= ${start}
            AND "createdAt" <= ${end}
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY DATE_TRUNC('month', "createdAt") ASC
        `
      : prisma.$queryRaw<{ label: string; total: number; count: number }[]>`
          SELECT
            TO_CHAR(DATE("createdAt"), 'DD Mon') AS label,
            COALESCE(SUM(total), 0)::float AS total,
            COUNT(*)::int AS count
          FROM "Venta"
          WHERE status = 'completed'
            AND "createdAt" >= ${start}
            AND "createdAt" <= ${end}
          GROUP BY DATE("createdAt")
          ORDER BY DATE("createdAt") ASC
        `,
  ])

  // Resolve product names
  const productIds = topProductsRaw.map((p: { productId: string }) => p.productId)
  const productsInfo = productIds.length
    ? await prisma.producto.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      })
    : []
  const productMap = Object.fromEntries(productsInfo.map((p: { id: string; name: string }) => [p.id, p.name]))

  // Resolve client names
  const clientIds = topClientsRaw
    .map((c: { clientId: string | null }) => c.clientId)
    .filter(Boolean) as string[]
  const clientsInfo = clientIds.length
    ? await prisma.cliente.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : []
  const clientMap = Object.fromEntries(
    clientsInfo.map((c: { id: string; firstName: string; lastName: string | null }) => [
      c.id,
      `${c.firstName} ${c.lastName ?? ""}`.trim(),
    ])
  )

  return {
    salesAgg,
    servicesAgg,
    topProducts: topProductsRaw.map((p: { productId: string; _sum: { quantity: number | null } }) => ({
      name: productMap[p.productId] ?? "—",
      quantity: p._sum.quantity ?? 0,
    })),
    topClients: topClientsRaw.map((c: { clientId: string | null; _sum: { total: unknown }; _count: number }) => ({
      name: clientMap[c.clientId!] ?? "Anónimo",
      total: Number(c._sum.total ?? 0),
      count: c._count,
    })),
    lowStock,
    chartData: chartRaw as { label: string; total: number; count: number }[],
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}) {
  const { period = "month", from, to } = await searchParams
  const { start, end } = getDateRange(period, from, to)
  const data = await getReportData(start, end, period)

  const ventasTotal = Number(data.salesAgg._sum.total ?? 0)
  const serviciosTotal = Number(data.servicesAgg._sum.amount ?? 0)
  const ingresoTotal = ventasTotal + serviciosTotal

  const kpiCards = [
    {
      label: "Ventas",
      value: `$${ventasTotal.toLocaleString("es-AR")}`,
      sub: `${data.salesAgg._count} transacciones`,
      gradient: "bg-linear-to-br from-yellow-400 to-yellow-500",
      shadow: "shadow-lg shadow-yellow-400/30",
      icon: "TrendingUp" as const,
      textDark: true,
    },
    {
      label: "Servicios",
      value: `$${serviciosTotal.toLocaleString("es-AR")}`,
      sub: `${data.servicesAgg._count} servicios`,
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
      value: String(data.lowStock.length),
      sub: "Requieren reposición",
      gradient: "bg-linear-to-br from-rose-500 to-red-600",
      shadow: "shadow-lg shadow-rose-500/30",
      icon: "PackageX" as const,
    },
  ]

  const maxProduct = Math.max(...data.topProducts.map((p: { quantity: number }) => p.quantity), 1)
  const maxClient = Math.max(...data.topClients.map((c: { total: number }) => c.total), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader
          title="Reportes"
          description={periodLabel(period, start, end)}
        />
        <PeriodSelector currentPeriod={period} currentFrom={from} currentTo={to} />
      </div>

      {/* KPI cards */}
      <ReporteKPICards cards={kpiCards} />

      {/* Chart */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold">Ventas por período</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {period === "year" ? "Agrupado por mes" : "Agrupado por día"}
          </p>
        </div>
        <div className="p-5">
          <ReporteVentasChart data={data.chartData} />
        </div>
      </div>

      {/* Top productos + Top clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Productos */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold">Top productos vendidos</h2>
            <Badge variant="secondary">{data.topProducts.length}</Badge>
          </div>
          <div className="p-5 space-y-4">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos en el período.</p>
            ) : (
              data.topProducts.map((p: { name: string; quantity: number }, i: number) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-muted-foreground w-4 text-right">
                        {i + 1}
                      </span>
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

        {/* Top Clientes */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold">Mejores clientes</h2>
            <Badge variant="secondary">{data.topClients.length}</Badge>
          </div>
          <div className="p-5 space-y-4">
            {data.topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos en el período.</p>
            ) : (
              data.topClients.map((c: { name: string; total: number; count: number }, i: number) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-muted-foreground w-4 text-right">
                        {i + 1}
                      </span>
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

      {/* Stock bajo */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Productos con stock bajo</h2>
          {data.lowStock.length > 0 && (
            <Badge variant="destructive">{data.lowStock.length} productos</Badge>
          )}
        </div>
        <div className="p-2">
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground px-3 py-4">
              Todos los productos tienen stock suficiente.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {(data.lowStock as (Producto & { category: Categoria })[]).map((p) => (
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
