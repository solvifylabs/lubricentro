export const dynamic = 'force-dynamic'

import Link from "next/link"
import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PaginationNav } from "@/components/ui/pagination-nav"
import { Plus, Package, AlertTriangle, LayoutGrid } from "lucide-react"
import { StockSearch } from "@/components/stock/StockSearch"
import type { Producto, Categoria, Marca } from "@/types"

const PAGE_SIZE = 10

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string; page?: string }>
}) {
  const { search = "", categoryId = "", page = "1" } = await searchParams
  const pageNum = Math.max(1, parseInt(page))
  const skip = (pageNum - 1) * PAGE_SIZE

  const where = {
    active: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { code: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(categoryId && { categoryId }),
  }

  const [products, total, lowStockCount, categories] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { category: true, brand: true },
      orderBy: { name: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.producto.count({ where }),
    prisma.producto.count({ where: { active: true, stock: { lte: 5 } } }),
    prisma.categoria.findMany({ orderBy: { name: "asc" } }),
  ])

  const paginationParams: Record<string, string> = {}
  if (search) paginationParams.search = search
  if (categoryId) paginationParams.categoryId = categoryId

  return (
    <div>
      <PageHeader
        title="Stock"
        description={`${total} producto${total !== 1 ? "s" : ""} en inventario`}
        helpTour="stock"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild id="stock-cat-btn">
              <Link href="/stock/categorias">
                <LayoutGrid className="h-4 w-4 mr-1" />
                Categorías
              </Link>
            </Button>
            <Button asChild id="stock-new-btn">
              <Link href="/stock/nuevo">
                <Plus className="h-4 w-4 mr-1" /> Nuevo producto
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Package className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total productos</p>
            <p className="text-lg font-bold tabular-nums">{total}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 shrink-0">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stock bajo</p>
            <p className="text-lg font-bold tabular-nums text-amber-600">{lowStockCount}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <LayoutGrid className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Categorías</p>
            <p className="text-lg font-bold tabular-nums">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-3 mb-4" id="stock-search">
        <StockSearch categories={categories} />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" id="stock-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead className="text-right">Precio venta</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            )}
            {products.map((p: Producto & { category: Categoria; brand: Marca | null }) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{p.code ?? "—"}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-400/10 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                    {p.category.name}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.brand?.name ?? "—"}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ${Number(p.sellPrice).toLocaleString("es-AR")}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={p.stock <= p.minStock ? "destructive" : "secondary"}>
                    {p.stock} {p.unit}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/stock/${p.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationNav total={total} page={pageNum} pageSize={PAGE_SIZE} basePath="/stock" params={paginationParams} />
      </div>
    </div>
  )
}
