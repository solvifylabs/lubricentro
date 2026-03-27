export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { DetailHeader } from "@/components/layout/DetailHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProveedorForm } from "@/components/proveedores/ProveedorForm"
import { Truck, Package, ShoppingBag, Phone, Mail } from "lucide-react"
import type { ProveedorProducto, Producto, Categoria, Marca, Compra } from "@/types"

export default async function ProveedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supplier = await prisma.proveedor.findUnique({
    where: { id },
    include: {
      productLinks: { include: { product: { include: { category: true, brand: true } } } },
      purchases: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  })

  if (!supplier) notFound()

  const totalPurchased = supplier.purchases.reduce((acc, p) => acc + Number(p.total), 0)

  return (
    <div className="max-w-3xl mx-auto">
      <DetailHeader
        title={supplier.name}
        description={supplier.contactName ?? undefined}
        backHref="/proveedores"
        backLabel="Proveedores"
        icon={Truck}
        gradient="from-purple-500 to-violet-600"
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Productos</p>
            <p className="text-lg font-bold tabular-nums">{supplier.productLinks.length}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Compras</p>
            <p className="text-lg font-bold tabular-nums">{supplier.purchases.length}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <Truck className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total comprado</p>
            <p className="text-lg font-bold tabular-nums">${totalPurchased.toLocaleString("es-AR")}</p>
          </div>
        </div>
      </div>

      {/* Info row */}
      {(supplier.phone || supplier.email || supplier.address) && (
        <div className="rounded-xl border bg-card px-5 py-4 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {supplier.phone && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Teléfono</p>
              <a href={`tel:${supplier.phone}`} className="flex items-center gap-1.5 font-medium hover:underline">
                <Phone className="h-3.5 w-3.5" /> {supplier.phone}
              </a>
            </div>
          )}
          {supplier.email && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <a href={`mailto:${supplier.email}`} className="flex items-center gap-1.5 font-medium hover:underline truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" /> {supplier.email}
              </a>
            </div>
          )}
          {supplier.address && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Dirección</p>
              <p className="font-medium">{supplier.address}</p>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="productos">
        <TabsList>
          <TabsTrigger value="productos">Productos ({supplier.productLinks.length})</TabsTrigger>
          <TabsTrigger value="compras">Compras ({supplier.purchases.length})</TabsTrigger>
          <TabsTrigger value="editar">Editar</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="mt-4 space-y-2">
          {supplier.productLinks.length === 0 ? (
            <div className="rounded-xl border bg-card px-5 py-10 text-center text-muted-foreground text-sm">
              Sin productos asociados.
            </div>
          ) : (
            supplier.productLinks.map(({ product }: ProveedorProducto & { product: Producto & { category: Categoria; brand: Marca | null } }) => (
              <div key={product.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.category.name}
                    {product.brand ? ` · ${product.brand.name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={product.stock <= product.minStock ? "destructive" : "secondary"}>
                    Stock: {product.stock}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/stock/${product.id}`}>Ver</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="compras" className="mt-4 space-y-2">
          {supplier.purchases.length === 0 ? (
            <div className="rounded-xl border bg-card px-5 py-10 text-center text-muted-foreground text-sm">
              Sin compras registradas.
            </div>
          ) : (
            supplier.purchases.map((purchase: Compra) => (
              <div key={purchase.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(purchase.createdAt).toLocaleDateString("es-AR")}
                  </p>
                  {purchase.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{purchase.notes}</p>
                  )}
                </div>
                <p className="font-semibold tabular-nums">${Number(purchase.total).toLocaleString("es-AR")}</p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="editar" className="mt-4">
          <ProveedorForm supplier={supplier} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
