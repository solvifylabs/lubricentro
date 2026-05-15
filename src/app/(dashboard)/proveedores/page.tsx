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
import { Plus, Phone, Truck, Package, ShoppingBag } from "lucide-react"

const PAGE_SIZE = 10

function ProveedoresPageInner() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search") ?? ""
  const pageNum = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const skip = (pageNum - 1) * PAGE_SIZE

  const store = useDemoStore()

  const filtered = store.proveedores
    .filter((s) => {
      if (!s.active) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        (s.contactName ?? "").toLowerCase().includes(q)
      )
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const total = filtered.length
  const totalProducts = store.proveedorProductos.length
  const totalPurchases = store.compras.length

  const suppliers = filtered.slice(skip, skip + PAGE_SIZE).map((s) => ({
    ...s,
    _count: {
      purchases: store.compras.filter((c) => c.supplierId === s.id).length,
      productLinks: store.proveedorProductos.filter((pp) => pp.supplierId === s.id).length,
    },
  }))

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
            {suppliers.map((s) => (
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

export default function ProveedoresPage() {
  return (
    <Suspense>
      <ProveedoresPageInner />
    </Suspense>
  )
}
