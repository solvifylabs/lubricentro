export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { DetailHeader } from "@/components/layout/DetailHeader"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ProductoForm } from "@/components/stock/ProductoForm"
import { StockMovimientoForm } from "@/components/stock/StockMovimientoForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Tag, Layers, TrendingUp } from "lucide-react"
import type { MovimientoStock } from "@/types"

export default async function ProductoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories, brands] = await Promise.all([
    prisma.producto.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        stockMovements: { orderBy: { createdAt: "desc" }, take: 30 },
      },
    }),
    prisma.categoria.findMany({ orderBy: { name: "asc" } }),
    prisma.marca.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!product) notFound()

  const isLowStock = product.stock <= product.minStock

  const typeLabel = (type: string) => {
    if (type === "entry") return { label: "Ingreso", className: "text-emerald-600 font-medium" }
    if (type === "exit") return { label: "Egreso", className: "text-rose-600 font-medium" }
    return { label: "Ajuste", className: "text-amber-600 font-medium" }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <DetailHeader
        title={product.name}
        description={`${product.category.name}${product.brand ? ` · ${product.brand.name}` : ""}`}
        backHref="/stock"
        backLabel="Stock"
        icon={Package}
        gradient="from-blue-500 to-indigo-600"
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isLowStock ? "bg-rose-50 dark:bg-rose-500/10" : "bg-blue-50 dark:bg-blue-500/10"}`}>
            <Package className={`h-4 w-4 ${isLowStock ? "text-rose-500" : "text-blue-500"}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stock actual</p>
            <p className={`text-lg font-bold tabular-nums ${isLowStock ? "text-rose-600" : ""}`}>
              {product.stock} <span className="text-sm font-normal text-muted-foreground">{product.unit}</span>
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 shrink-0">
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stock mínimo</p>
            <p className="text-lg font-bold tabular-nums">
              {product.minStock} <span className="text-sm font-normal text-muted-foreground">{product.unit}</span>
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <Tag className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio venta</p>
            <p className="text-lg font-bold tabular-nums">${Number(product.sellPrice).toLocaleString("es-AR")}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Movimientos</p>
            <p className="text-lg font-bold tabular-nums">{product.stockMovements.length}</p>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="rounded-xl border bg-card px-5 py-4 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        {product.code && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Código</p>
            <p className="font-mono font-medium">{product.code}</p>
          </div>
        )}
        {product.buyPrice && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Precio costo</p>
            <p className="font-medium">${Number(product.buyPrice).toLocaleString("es-AR")}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Estado</p>
          <Badge variant={isLowStock ? "destructive" : "secondary"}>
            {isLowStock ? "Stock bajo" : "Normal"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="movimiento">
        <TabsList>
          <TabsTrigger value="movimiento">Movimiento de stock</TabsTrigger>
          <TabsTrigger value="historial">Historial ({product.stockMovements.length})</TabsTrigger>
          <TabsTrigger value="editar">Editar</TabsTrigger>
        </TabsList>

        <TabsContent value="movimiento" className="mt-4">
          <StockMovimientoForm productId={product.id} productName={product.name} />
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.stockMovements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      Sin movimientos registrados.
                    </TableCell>
                  </TableRow>
                )}
                {product.stockMovements.map((m: MovimientoStock) => {
                  const t = typeLabel(m.type)
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm tabular-nums">
                        {new Date(m.createdAt).toLocaleString("es-AR")}
                      </TableCell>
                      <TableCell className={t.className}>{t.label}</TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{m.reason ?? "—"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="editar" className="mt-4">
          <ProductoForm categories={categories} brands={brands} product={product} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
