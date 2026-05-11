export const dynamic = 'force-dynamic'

import Link from "next/link"
import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PaginationNav } from "@/components/ui/pagination-nav"
import { Plus, Waves, DollarSign, CalendarClock, Package, AlertTriangle } from "lucide-react"
import { WashPriceConfig } from "@/components/lava-auto/WashPriceConfig"
import type { SesionLavaAuto, Producto } from "@/types"

const PAGE_SIZE = 20

export default async function LavaAutoPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; page?: string }>
}) {
  const { date = "", page = "1" } = await searchParams
  const pageNum = Math.max(1, parseInt(page))
  const skip = (pageNum - 1) * PAGE_SIZE

  const today = new Date().toISOString().split("T")[0]
  const activeDate = date || today

  const dateFilter = {
    sessionDate: {
      gte: new Date(`${activeDate}T00:00:00`),
      lte: new Date(`${activeDate}T23:59:59`),
    },
  }

  const todayFilter = {
    sessionDate: {
      gte: new Date(`${today}T00:00:00`),
      lte: new Date(`${today}T23:59:59`),
    },
  }

  const [sessions, total, todayCount, todayAggregate, totalCount, dailyProducts, config] =
    await Promise.all([
      prisma.sesionLavaAuto.findMany({
        where: dateFilter,
        include: {
          _count: { select: { products: true } },
          vehicle: { select: { id: true, plate: true } },
        },
        orderBy: { sessionDate: "desc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.sesionLavaAuto.count({ where: dateFilter }),
      prisma.sesionLavaAuto.count({ where: todayFilter }),
      prisma.sesionLavaAuto.aggregate({ where: todayFilter, _sum: { amount: true } }),
      prisma.sesionLavaAuto.count(),
      prisma.sesionProducto.groupBy({
        by: ["productId"],
        where: { session: todayFilter },
        _sum: { quantity: true },
      }),
      prisma.configLavaAuto.findFirst(),
    ])

  const todayTotal = Number(todayAggregate._sum.amount ?? 0)
  const washPrices = {
    priceInterior: config ? Number(config.priceInterior) : 0,
    priceExterior: config ? Number(config.priceExterior) : 0,
    priceIntegro: config ? Number(config.priceIntegro) : 0,
  }

  // Fetch product details for daily consumption
  const productIds = dailyProducts.map((dp) => dp.productId)
  const productDetails = productIds.length
    ? await prisma.producto.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, expectedConsumptionPerWash: true },
      })
    : []

  const productMap = new Map(productDetails.map((p) => [p.id, p]))

  const paginationParams: Record<string, string> = {}
  if (date) paginationParams.date = date

  return (
    <div>
      <PageHeader
        title="Lava Auto"
        description={`${totalCount} lavado${totalCount !== 1 ? "s" : ""} registrados`}
        action={
          <div className="flex items-center gap-2">
            <WashPriceConfig prices={washPrices} />
            <Button asChild>
              <Link href="/lava-auto/nuevo">
                <Plus className="h-4 w-4 mr-1" /> Nuevo lavado
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <Waves className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lavados hoy</p>
            <p className="text-lg font-bold tabular-nums">{todayCount}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <CalendarClock className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Productos usados hoy</p>
            <p className="text-lg font-bold tabular-nums">
              {dailyProducts.reduce((acc, p) => acc + (p._sum.quantity ?? 0), 0)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recaudado hoy</p>
            <p className="text-lg font-bold tabular-nums text-blue-600">
              ${todayTotal.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-3 mb-4">
        <form className="flex gap-3 flex-wrap">
          <Input
            name="date"
            type="date"
            defaultValue={activeDate}
            className="w-44 bg-background"
          />
        </form>
      </div>

      {/* Sessions table */}
      <div className="rounded-xl border overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hora</TableHead>
              <TableHead>Patente</TableHead>
              <TableHead className="text-center">Productos</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No hay lavados para esta fecha.
                </TableCell>
              </TableRow>
            )}
            {(sessions as (SesionLavaAuto & { _count: { products: number }; vehicle: { id: string; plate: string } | null })[]).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {new Date(s.sessionDate).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {s.plate ? (
                    s.vehicleId ? (
                      <Link href={`/vehiculos/${s.vehicleId}`} className="hover:opacity-80 transition-opacity">
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 px-2 py-0.5 rounded-md text-sm">
                          {s.plate}
                        </span>
                      </Link>
                    ) : (
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 px-2 py-0.5 rounded-md text-sm">
                        {s.plate}
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Anónimo</span>
                  )}
                </TableCell>
                <TableCell className="text-center text-sm tabular-nums">
                  {s._count.products}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ${Number(s.amount).toLocaleString("es-AR")}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/lava-auto/${s.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationNav
          total={total}
          page={pageNum}
          pageSize={PAGE_SIZE}
          basePath="/lava-auto"
          params={paginationParams}
        />
      </div>

      {/* Daily product consumption (REQ-LAVA-4) */}
      {dailyProducts.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <p className="font-semibold text-sm">Consumo de productos — hoy</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Consumido</TableHead>
                <TableHead className="text-right">Esperado por lavado</TableHead>
                <TableHead className="text-right">Esperado total ({todayCount} lavados)</TableHead>
                <TableHead className="text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyProducts.map((dp) => {
                const prod = productMap.get(dp.productId)
                const consumed = dp._sum.quantity ?? 0
                const expectedPerWash = prod?.expectedConsumptionPerWash
                  ? Number(prod.expectedConsumptionPerWash)
                  : null
                const expectedTotal =
                  expectedPerWash != null ? expectedPerWash * todayCount : null
                const isOver =
                  expectedTotal != null && consumed > expectedTotal * 1.1

                return (
                  <TableRow key={dp.productId}>
                    <TableCell className="font-medium">{prod?.name ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{consumed}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {expectedPerWash != null ? expectedPerWash : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {expectedTotal != null ? expectedTotal.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isOver ? (
                        <span className="flex items-center justify-end gap-1 text-destructive text-xs font-medium">
                          <AlertTriangle className="h-3.5 w-3.5" /> Desvío
                        </span>
                      ) : expectedTotal != null ? (
                        <span className="text-green-600 dark:text-green-400 text-xs font-medium">OK</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sin ref.</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
