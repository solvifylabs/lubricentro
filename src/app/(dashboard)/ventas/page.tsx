export const dynamic = 'force-dynamic'

import Link from "next/link"
import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PaginationNav } from "@/components/ui/pagination-nav"
import { Plus, ShoppingCart, DollarSign, XCircle } from "lucide-react"
import type { Venta, Cliente } from "@/types"

type SaleRow = Venta & {
  client: Pick<Cliente, "id" | "firstName" | "lastName"> | null
  items: { quantity: number; price: unknown; product: { name: string } }[]
}

const PAGE_SIZE = 15

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; page?: string }>
}) {
  const { date, page = "1" } = await searchParams
  const today = new Date().toISOString().split("T")[0]
  const filterDate = date || today
  const pageNum = Math.max(1, parseInt(page))
  const skip = (pageNum - 1) * PAGE_SIZE

  const dateWhere = {
    createdAt: {
      gte: new Date(`${filterDate}T00:00:00`),
      lte: new Date(`${filterDate}T23:59:59`),
    },
  }

  const [sales, total, aggregate, cancelledCount] = await Promise.all([
    prisma.venta.findMany({
      where: dateWhere,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        items: { select: { quantity: true, price: true, product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.venta.count({ where: dateWhere }),
    prisma.venta.aggregate({
      where: { ...dateWhere, status: "completed" },
      _sum: { total: true },
    }),
    prisma.venta.count({ where: { ...dateWhere, status: "cancelled" } }),
  ])

  const totalDia = Number(aggregate._sum.total ?? 0)

  const paginationParams: Record<string, string> = {}
  if (date) paginationParams.date = date

  return (
    <div>
      <PageHeader
        title="Ventas"
        description={`${total} venta${total !== 1 ? "s" : ""} el ${new Date(filterDate + "T12:00:00").toLocaleDateString("es-AR")}`}
        helpTour="ventas"
        action={
          <Button asChild id="ventas-new-btn">
            <Link href="/ventas/nueva">
              <Plus className="h-4 w-4 mr-1" /> Nueva venta
            </Link>
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <ShoppingCart className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ventas del día</p>
            <p className="text-lg font-bold tabular-nums">{total}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total facturado</p>
            <p className="text-lg font-bold tabular-nums text-yellow-600">${totalDia.toLocaleString("es-AR")}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 shrink-0">
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Anuladas</p>
            <p className="text-lg font-bold tabular-nums text-rose-600">{cancelledCount}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-card border rounded-xl p-3 mb-4" id="ventas-date">
        <form>
          <Input
            name="date"
            type="date"
            defaultValue={filterDate}
            className="w-44 bg-background"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" id="ventas-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No hay ventas para esta fecha.
                </TableCell>
              </TableRow>
            )}
            {(sales as SaleRow[]).map((s: SaleRow) => (
              <TableRow key={s.id} className={s.status === "cancelled" ? "opacity-50" : ""}>
                <TableCell className="text-sm tabular-nums">
                  {new Date(s.createdAt).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {s.client ? (
                    <Link href={`/clientes/${s.client.id}`} className="hover:underline text-sm">
                      {s.client.firstName} {s.client.lastName ?? ""}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin cliente</span>
                  )}
                </TableCell>
                <TableCell>
                  <p className="text-sm">
                    {s.items.map((i) => i.product.name).join(", ")}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={s.status === "completed" ? "secondary" : "destructive"}>
                    {s.status === "completed" ? "Completada" : "Anulada"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ${Number(s.total).toLocaleString("es-AR")}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/ventas/${s.id}`}>Ver</Link>
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
          basePath="/ventas"
          params={paginationParams}
        />
      </div>
    </div>
  )
}
