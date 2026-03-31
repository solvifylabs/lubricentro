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
import { Plus, Phone, Truck, Package, ShoppingBag } from "lucide-react"
import type { Proveedor } from "@/types"

const PAGE_SIZE = 10

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { search = "", page = "1" } = await searchParams
  const pageNum = Math.max(1, parseInt(page))
  const skip = (pageNum - 1) * PAGE_SIZE

  const where = {
    active: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { contactName: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  }

  const [suppliers, total, totalProducts, totalPurchases] = await Promise.all([
    prisma.proveedor.findMany({
      where,
      include: {
        _count: { select: { purchases: true, productLinks: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.proveedor.count({ where }),
    prisma.proveedorProducto.count(),
    prisma.compra.count(),
  ])

  const paginationParams: Record<string, string> = {}
  if (search) paginationParams.search = search

  return (
    <div>
      <PageHeader
        title="Proveedores"
        description={`${total} proveedor${total !== 1 ? "es" : ""} registrados`}
        helpTour="proveedores"
        action={
          <Button asChild id="proveedores-new-btn">
            <Link href="/proveedores/nuevo">
              <Plus className="h-4 w-4 mr-1" /> Nuevo proveedor
            </Link>
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Truck className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Proveedores</p>
            <p className="text-lg font-bold tabular-nums">{total}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Package className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Productos vinculados</p>
            <p className="text-lg font-bold tabular-nums">{totalProducts}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Compras totales</p>
            <p className="text-lg font-bold tabular-nums">{totalPurchases}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-3 mb-4" id="proveedores-search">
        <form>
          <Input
            name="search"
            placeholder="Buscar por nombre o contacto..."
            defaultValue={search}
            className="max-w-sm bg-background"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" id="proveedores-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-center">Productos</TableHead>
              <TableHead className="text-center">Compras</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No hay proveedores registrados.
                </TableCell>
              </TableRow>
            )}
            {suppliers.map((s: Proveedor & { _count: { purchases: number; productLinks: number } }) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.contactName ?? "—"}</TableCell>
                <TableCell>
                  {s.phone ? (
                    <a href={`tel:${s.phone}`} className="flex items-center gap-1 hover:underline">
                      <Phone className="h-3 w-3" />
                      {s.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">{s._count.productLinks}</TableCell>
                <TableCell className="text-center">{s._count.purchases}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/proveedores/${s.id}`}>Ver</Link>
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
          basePath="/proveedores"
          params={paginationParams}
        />
      </div>
    </div>
  )
}
