"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { useDemoStore } from "@/lib/demo/store"
import { DetailHeader } from "@/components/layout/DetailHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProveedorForm } from "@/components/proveedores/ProveedorForm"
import { Truck, Package, ShoppingBag, Phone, Mail } from "lucide-react"

export default function ProveedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const store = useDemoStore()

  const supplier = store.proveedores.find((s) => s.id === id)
  if (!supplier) { notFound(); return null }

  const productLinks = store.proveedorProductos
    .filter((pp) => pp.supplierId === id)
    .map((pp) => {
      const product = store.productos.find((p) => p.id === pp.productId)!
      const category = store.categorias.find((c) => c.id === product.categoryId)!
      const brand = product.brandId ? store.marcas.find((m) => m.id === product.brandId) ?? null : null
      return { ...pp, product: { ...product, category, brand } }
    })

  const purchases = store.compras
    .filter((c) => c.supplierId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)

  const totalPurchased = purchases.reduce((acc, p) => acc + Number(p.total), 0)

  return (
    <div className="max-w-3xl mx-auto">
      <DetailHeader
        title={supplier.name}
        description={supplier.contactName ?? undefined}
        backHref="/proveedores"
        backLabel="Proveedores"
        icon={Truck}
        gradient="from-yellow-400 to-yellow-500"
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Package className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Productos</p>
            <p className="text-lg font-bold tabular-nums">{productLinks.length}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Compras</p>
            <p className="text-lg font-bold tabular-nums">{purchases.length}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Truck className="h-4 w-4 text-yellow-500" />
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
          <TabsTrigger value="productos">Productos ({productLinks.length})</TabsTrigger>
          <TabsTrigger value="compras">Compras ({purchases.length})</TabsTrigger>
          <TabsTrigger value="editar">Editar</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="mt-4 space-y-2">
          {productLinks.length === 0 ? (
            <div className="rounded-xl border bg-card px-5 py-10 text-center text-muted-foreground text-sm">
              Sin productos asociados.
            </div>
          ) : (
            productLinks.map(({ product }) => (
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
          {purchases.length === 0 ? (
            <div className="rounded-xl border bg-card px-5 py-10 text-center text-muted-foreground text-sm">
              Sin compras registradas.
            </div>
          ) : (
            purchases.map((purchase) => (
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
          <ProveedorForm supplier={supplier as unknown as Parameters<typeof ProveedorForm>[0]["supplier"]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
