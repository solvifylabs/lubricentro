"use client"

import { Suspense } from "react"
import { useDemoStore } from "@/lib/demo/store"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { VehiculoForm } from "@/components/vehiculos/VehiculoForm"

function NuevoVehiculoPageInner() {
  const searchParams = useSearchParams()
  const clientId = searchParams.get("clientId") ?? undefined

  const store = useDemoStore()
  const clients = store.clientes
    .filter((c) => c.active)
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))

  return (
    <div className="max-w-xl">
      <PageHeader title="Nuevo vehículo" />
      <VehiculoForm clients={clients} defaultClientId={clientId} />
    </div>
  )
}

export default function NuevoVehiculoPage() {
  return (
    <Suspense>
      <NuevoVehiculoPageInner />
    </Suspense>
  )
}
