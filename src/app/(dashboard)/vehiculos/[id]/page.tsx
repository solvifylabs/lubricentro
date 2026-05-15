"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { useDemoStore } from "@/lib/demo/store"
import { DetailHeader } from "@/components/layout/DetailHeader"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehiculoForm } from "@/components/vehiculos/VehiculoForm"
import { Plus, Car, Wrench, CalendarDays, Gauge } from "lucide-react"

export default function VehiculoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const store = useDemoStore()

  const vehicle = store.vehiculos.find((v) => v.id === id)
  if (!vehicle) { notFound(); return null }

  const client = vehicle.clientId ? store.clientes.find((c) => c.id === vehicle.clientId) ?? null : null
  const services = store.servicios
    .filter((s) => s.vehicleId === id)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
    .map((s) => ({
      ...s,
      products: store.servicioProductos
        .filter((sp) => sp.serviceId === s.id)
        .map((sp) => ({
          ...sp,
          product: store.productos.find((p) => p.id === sp.productId)!,
        })),
    }))

  const clients = store.clientes
    .filter((c) => c.active)
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))

  const lastService = services[0]
  const totalAmount = services.reduce((acc, s) => acc + Number(s.amount), 0)

  const vehicleWithClient = { ...vehicle, client }

  return (
    <div className="max-w-3xl mx-auto">
      <DetailHeader
        title={vehicle.plate}
        description={`${vehicle.brand} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ""}`}
        backHref="/vehiculos"
        backLabel="Vehículos"
        icon={Car}
        gradient="from-yellow-400 to-yellow-500"
        actions={
          <Button asChild>
            <Link href={`/servicios/nuevo?vehicleId=${vehicle.id}`}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo servicio
            </Link>
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Wrench className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Servicios</p>
            <p className="text-lg font-bold tabular-nums">{services.length}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <CalendarDays className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Último service</p>
            <p className="text-base font-bold">
              {lastService ? new Date(lastService.serviceDate).toLocaleDateString("es-AR") : "—"}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <Gauge className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total facturado</p>
            <p className="text-lg font-bold tabular-nums">${totalAmount.toLocaleString("es-AR")}</p>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="rounded-xl border bg-card px-5 py-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Dominio</p>
          <span className="font-mono font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 px-2 py-0.5 rounded-md text-sm">
            {vehicle.plate}
          </span>
        </div>
        {vehicle.engine && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Motor</p>
            <p className="font-medium">{vehicle.engine}</p>
          </div>
        )}
        {vehicle.year && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Año</p>
            <p className="font-medium">{vehicle.year}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Cliente</p>
          {client ? (
            <Link href={`/clientes/${client.id}`} className="font-medium hover:underline text-yellow-600 dark:text-yellow-400">
              {client.firstName} {client.lastName ?? ""}
            </Link>
          ) : (
            <span className="text-muted-foreground">Sin asignar</span>
          )}
        </div>
      </div>

      <Tabs defaultValue="servicios">
        <TabsList>
          <TabsTrigger value="servicios">Servicios ({services.length})</TabsTrigger>
          <TabsTrigger value="editar">Editar</TabsTrigger>
        </TabsList>

        <TabsContent value="servicios" className="mt-4 space-y-2">
          {services.length === 0 ? (
            <div className="rounded-xl border bg-card px-5 py-10 text-center text-muted-foreground text-sm">
              Sin servicios registrados.
            </div>
          ) : (
            services.map((s) => (
              <div key={s.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">
                    {new Date(s.serviceDate).toLocaleDateString("es-AR")}
                    {s.mileage ? (
                      <span className="text-muted-foreground font-normal ml-2">· {s.mileage.toLocaleString("es-AR")} km</span>
                    ) : null}
                  </p>
                  {s.nextServiceDate && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Próximo: {new Date(s.nextServiceDate).toLocaleDateString("es-AR")}
                      {s.nextServiceKm ? ` · ${s.nextServiceKm.toLocaleString("es-AR")} km` : ""}
                    </p>
                  )}
                  {s.notes && <p className="text-xs text-muted-foreground mt-0.5">{s.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold tabular-nums">${Number(s.amount).toLocaleString("es-AR")}</p>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/servicios/${s.id}`}>Ver</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="editar" className="mt-4">
          <VehiculoForm
            vehicle={vehicleWithClient as unknown as Parameters<typeof VehiculoForm>[0]["vehicle"]}
            clients={clients}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
