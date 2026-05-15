"use client"

import { Suspense } from "react"
import { useDemoStore } from "@/lib/demo/store"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { ServicioForm } from "@/components/servicios/ServicioForm"

function NuevoServicioPageInner() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get("vehicleId") ?? undefined

  const store = useDemoStore()

  const vehicles = [...store.vehiculos]
    .sort((a, b) => a.plate.localeCompare(b.plate))
    .map((v) => ({
      ...v,
      client: v.clientId
        ? store.clientes.find((c) => c.id === v.clientId) ?? null
        : null,
    }))

  const products = store.productos
    .filter((p) => p.active)
    .sort((a, b) => a.name.localeCompare(b.name))

  const defaultServicePrice = Number(store.configServicio.servicePrice)

  return (
    <div className="container">
      <PageHeader title="Nuevo servicio" />
      <ServicioForm
        vehicles={vehicles as unknown as Parameters<typeof ServicioForm>[0]["vehicles"]}
        products={products as unknown as Parameters<typeof ServicioForm>[0]["products"]}
        defaultVehicleId={vehicleId}
        defaultServicePrice={defaultServicePrice}
      />
    </div>
  )
}

export default function NuevoServicioPage() {
  return (
    <Suspense>
      <NuevoServicioPageInner />
    </Suspense>
  )
}
