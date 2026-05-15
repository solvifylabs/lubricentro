"use client"

import { Suspense } from "react"
import { useDemoStore } from "@/lib/demo/store"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PaginationNav } from "@/components/ui/pagination-nav"
import { Plus, Waves, DollarSign, CalendarClock, Package, AlertTriangle } from "lucide-react"
import { WashPriceConfig } from "@/components/lava-auto/WashPriceConfig"

const PAGE_SIZE = 20

function LavaAutoPageInner() {
  const searchParams = useSearchParams()
  const date = searchParams.get("date") ?? ""
  const pageNum = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const skip = (pageNum - 1) * PAGE_SIZE

  const store = useDemoStore()
  const today = new Date().toISOString().split("T")[0]
  const activeDate = date || today

  const filtered = store.sesiones
    .filter((s) => new Date(s.sessionDate).toISOString().split("T")[0] === activeDate)
    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())

  const total = filtered.length
  const totalCount = store.sesiones.length

  const todaySessions = store.sesiones.filter((s) => new Date(s.sessionDate).toISOString().split("T")[0] === today)
  const todayCount = todaySessions.length
  const todayTotal = todaySessions.reduce((acc, s) => acc + Number(s.amount), 0)

  // Daily product consumption for today
  const todaySessionIds = new Set(todaySessions.map((s) => s.id))
  const todaySesionProductos = store.sesionProductos.filter((sp) => todaySessionIds.has(sp.sessionId))

  const productConsumptionMap = new Map<string, number>()
  for (const sp of todaySesionProductos) {
    productConsumptionMap.set(sp.productId, (productConsumptionMap.get(sp.productId) ?? 0) + sp.quantity)
  }

  const dailyProducts = [...productConsumptionMap.entries()].map(([productId, qty]) => ({
    productId,
    consumed: qty,
    product: store.productos.find((p) => p.id === productId),
  }))

  const totalProductsUsed = dailyProducts.reduce((acc, dp) => acc + dp.consumed, 0)

  const config = store.configLavaAuto
  const washPrices = {
    priceInterior: Number(config.priceInterior),
    priceExterior: Number(config.priceExterior),
    priceIntegro: Number(config.priceIntegro),
  }

  const sessions = filtered.slice(skip, skip + PAGE_SIZE).map((s) => ({
    ...s,
    _count: { products: store.sesionProductos.filter((sp) => sp.sessionId === s.id).length },
    vehicle: s.vehicleId ? store.vehiculos.find((v) => v.id === s.vehicleId) ?? null : null,
  }))

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
            <p className="text-lg font-bold tabular-nums">{totalProductsUsed}</p>
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
            {sessions.map((s) => (
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

      {/* Daily product consumption */}
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
                const expectedPerWash = dp.product?.expectedConsumptionPerWash
                  ? Number(dp.product.expectedConsumptionPerWash)
                  : null
                const expectedTotal = expectedPerWash != null ? expectedPerWash * todayCount : null
                const isOver = expectedTotal != null && dp.consumed > expectedTotal * 1.1

                return (
                  <TableRow key={dp.productId}>
                    <TableCell className="font-medium">{dp.product?.name ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{dp.consumed}</TableCell>
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

export default function LavaAutoPage() {
  return (
    <Suspense>
      <LavaAutoPageInner />
    </Suspense>
  )
}
