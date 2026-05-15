"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { useDemoStore } from "@/lib/demo/store"
import { DetailHeader } from "@/components/layout/DetailHeader"
import { Separator } from "@/components/ui/separator"
import { Waves, Car, Package, AlertTriangle } from "lucide-react"

export default function LavaAutoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const store = useDemoStore()

  const session = store.sesiones.find((s) => s.id === id)
  if (!session) { notFound(); return null }

  const turno = session.turnoId ? store.turnos.find((t) => t.id === session.turnoId) ?? null : null
  const vehicle = session.vehicleId ? store.vehiculos.find((v) => v.id === session.vehicleId) ?? null : null
  const vehicleClient = vehicle?.clientId ? store.clientes.find((c) => c.id === vehicle.clientId) ?? null : null

  const products = store.sesionProductos
    .filter((sp) => sp.sessionId === id)
    .map((sp) => {
      const product = store.productos.find((p) => p.id === sp.productId)!
      const brand = product.brandId ? store.marcas.find((m) => m.id === product.brandId) ?? null : null
      return { ...sp, product: { ...product, brand } }
    })

  const dateLabel = new Date(session.sessionDate).toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const timeLabel = new Date(session.sessionDate).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="container mx-auto">
      <DetailHeader
        title={session.plate ? `Lavado — ${session.plate}` : "Lavado — Anónimo"}
        description={`${dateLabel} · ${timeLabel}`}
        backHref="/lava-auto"
        backLabel="Lava Auto"
        icon={Waves}
        gradient="from-blue-400 to-blue-500"
      />

      {/* Summary card */}
      <div className="rounded-xl border bg-card overflow-hidden mb-4">
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Detalle del lavado</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Vehículo</span>
            {session.plate ? (
              <span className="font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 px-2 py-0.5 rounded-md">
                {session.plate}
              </span>
            ) : (
              <span className="text-muted-foreground italic">Anónimo</span>
            )}
          </div>
          {vehicle && vehicleClient && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cliente</span>
              <Link
                href={`/vehiculos/${vehicle.id}`}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {[vehicleClient.firstName, vehicleClient.lastName].filter(Boolean).join(" ")}
              </Link>
            </div>
          )}
          {turno && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Turno</span>
              <span className="font-medium">
                {new Date(turno.startedAt).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {turno.endedAt && (
                  <> — {new Date(turno.endedAt).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</>
                )}
              </span>
            </div>
          )}
          {session.notes && (
            <div className="flex items-start justify-between text-sm gap-4">
              <span className="text-muted-foreground shrink-0">Observaciones</span>
              <span className="text-right">{session.notes}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>Total cobrado</span>
            <span className="tabular-nums">${Number(session.amount).toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* Products used + rendimiento */}
      {products.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <p className="font-semibold text-sm">Productos utilizados</p>
          </div>
          <div className="px-5 py-4 space-y-4">
            {products.map((item) => {
              const expected = item.product.expectedConsumptionPerWash
                ? Number(item.product.expectedConsumptionPerWash)
                : null
              const isOver = expected != null && item.quantity > expected * 1.1

              return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">
                      {item.product.name}
                      {item.product.brand && (
                        <span className="ml-2 text-xs text-muted-foreground border px-1.5 py-0.5 rounded">
                          {item.product.brand.name}
                        </span>
                      )}
                    </p>
                    {expected != null && (
                      <p className={`text-xs mt-0.5 flex items-center gap-1 ${isOver ? "text-destructive" : "text-muted-foreground"}`}>
                        {isOver && <AlertTriangle className="h-3 w-3" />}
                        Esperado: {expected} · Usado: {item.quantity}
                        {isOver ? " — desvío" : ""}
                      </p>
                    )}
                  </div>
                  <span className="font-bold tabular-nums ml-4">×{item.quantity}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="rounded-xl border bg-muted/40 px-5 py-8 text-center text-sm text-muted-foreground">
          Sin productos registrados en este lavado.
        </div>
      )}
    </div>
  )
}
