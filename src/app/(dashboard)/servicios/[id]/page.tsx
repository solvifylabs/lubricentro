"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { useDemoStore } from "@/lib/demo/store"
import { DetailHeader } from "@/components/layout/DetailHeader"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WhatsAppButton } from "@/components/clientes/WhatsAppButton"
import { Car, User, Wrench, Gauge, CalendarDays } from "lucide-react"

export default function ServicioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const store = useDemoStore()

  const service = store.servicios.find((s) => s.id === id)
  if (!service) { notFound(); return null }

  const vehicle = service.vehicleId ? store.vehiculos.find((v) => v.id === service.vehicleId) ?? null : null
  const client = vehicle?.clientId ? store.clientes.find((c) => c.id === vehicle.clientId) ?? null : null

  const products = store.servicioProductos
    .filter((sp) => sp.serviceId === id)
    .map((sp) => {
      const product = store.productos.find((p) => p.id === sp.productId)!
      const brand = product.brandId ? store.marcas.find((m) => m.id === product.brandId) ?? null : null
      return { ...sp, product: { ...product, brand } }
    })

  return (
    <div className="container mx-auto">
      <DetailHeader
        title={`Servicio — ${vehicle?.plate ?? "Anónimo"}`}
        description={new Date(service.serviceDate).toLocaleDateString("es-AR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        backHref="/servicios"
        backLabel="Servicios"
        icon={Wrench}
        gradient="from-yellow-400 to-yellow-500"
        actions={
          client?.phone ? (
            <WhatsAppButton
              phone={client.phone}
              label="Avisar próximo service"
              message={`Hola ${client.firstName}! Tu ${vehicle?.brand} ${vehicle?.model} (${vehicle?.plate}) tiene el próximo service el ${service.nextServiceDate ? new Date(service.nextServiceDate).toLocaleDateString("es-AR") : "próximamente"}${service.nextServiceKm ? ` a los ${service.nextServiceKm.toLocaleString("es-AR")} km` : ""}. ¡Estamos a tu disposición!`}
            />
          ) : undefined
        }
      />

      {/* Vehicle + Client */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border bg-card px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-400/10">
              <Car className="h-3.5 w-3.5 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Vehículo</p>
          </div>
          {vehicle ? (
            <>
              <Link href={`/vehiculos/${vehicle.id}`} className="font-mono font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 px-2 py-0.5 rounded-md text-sm hover:underline inline-block mb-1">
                {vehicle.plate}
              </Link>
              <p className="text-sm">{vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ""}</p>
              {vehicle.engine && <p className="text-xs text-muted-foreground">{vehicle.engine}</p>}
            </>
          ) : (
            <p className="text-muted-foreground">Sin vehículo</p>
          )}
        </div>

        <div className="rounded-xl border bg-card px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-400/10">
              <User className="h-3.5 w-3.5 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Cliente</p>
          </div>
          {client ? (
            <>
              <Link href={`/clientes/${client.id}`} className="font-bold text-base hover:underline">
                {client.firstName} {client.lastName ?? ""}
              </Link>
              {client.phone && (
                <p className="text-sm text-muted-foreground mt-0.5">{client.phone}</p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Sin cliente</p>
          )}
        </div>
      </div>

      {/* Service details */}
      <div className="rounded-xl border bg-card overflow-hidden mb-4">
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Detalles del servicio</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              Kilometraje
            </div>
            <span className="font-medium tabular-nums">
              {service.mileage ? `${service.mileage.toLocaleString("es-AR")} km` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Próximo service
            </div>
            <span className="font-medium">
              {service.nextServiceDate
                ? new Date(service.nextServiceDate).toLocaleDateString("es-AR")
                : "—"}
              {service.nextServiceKm ? ` · ${service.nextServiceKm.toLocaleString("es-AR")} km` : ""}
            </span>
          </div>
          {service.notes && (
            <div className="flex items-start justify-between text-sm gap-4">
              <span className="text-muted-foreground shrink-0">Observaciones</span>
              <span className="text-right">{service.notes}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span className="tabular-nums">${Number(service.amount).toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* Products used */}
      {products.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <p className="font-semibold text-sm">Productos utilizados</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {products.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">
                    {item.product.name}
                    {item.product.brand && (
                      <Badge variant="outline" className="ml-2 text-xs">{item.product.brand.name}</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">x{item.quantity} unidades</p>
                </div>
                <p className="tabular-nums font-medium">
                  ${Number(item.price).toLocaleString("es-AR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
