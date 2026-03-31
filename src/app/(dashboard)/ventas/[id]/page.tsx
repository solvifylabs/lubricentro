export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { DetailHeader } from "@/components/layout/DetailHeader"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CancelSaleButton } from "@/components/ventas/CancelSaleButton"
import { ShoppingCart, User, Tag } from "lucide-react"
import type { DetalleVenta, Producto } from "@/types"

export default async function VentaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const sale = await prisma.venta.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { product: true } },
    },
  })

  if (!sale) notFound()

  const isCompleted = sale.status === "completed"

  return (
    <div className="max-w-xl mx-auto">
      <DetailHeader
        title="Detalle de venta"
        description={new Date(sale.createdAt).toLocaleString("es-AR")}
        backHref="/ventas"
        backLabel="Ventas"
        icon={ShoppingCart}
        gradient="from-yellow-400 to-yellow-500"
        actions={isCompleted ? <CancelSaleButton saleId={sale.id} /> : undefined}
      />

      {/* Status + client */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isCompleted ? "bg-yellow-50 dark:bg-yellow-400/10" : "bg-rose-50 dark:bg-rose-500/10"}`}>
            <ShoppingCart className={`h-4 w-4 ${isCompleted ? "text-yellow-500" : "text-rose-500"}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge variant={isCompleted ? "secondary" : "destructive"} className="mt-0.5">
              {isCompleted ? "Completada" : "Anulada"}
            </Badge>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <User className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            {sale.client ? (
              <Link href={`/clientes/${sale.client.id}`} className="font-medium text-sm hover:underline">
                {sale.client.firstName} {sale.client.lastName ?? ""}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">Sin cliente</p>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Productos</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          {sale.items.map((item: DetalleVenta & { product: Producto }) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">x{item.quantity} unidades</p>
              </div>
              <p className="tabular-nums font-medium">
                ${(Number(item.price) * item.quantity).toLocaleString("es-AR")}
              </p>
            </div>
          ))}
          <Separator />
          {Number(sale.discount) > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Descuento</span>
              <span>- ${Number(sale.discount).toLocaleString("es-AR")}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="tabular-nums">${Number(sale.total).toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
