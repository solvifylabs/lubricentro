"use client"

import { useDemoStore } from "@/lib/demo/store"
import { VentaWizard } from "@/components/ventas/VentaWizard"

export default function NuevaVentaPage() {
  const store = useDemoStore()

  const products = store.productos
    .filter((p) => p.active && p.stock > 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  const clients = store.clientes
    .filter((c) => c.active)
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))

  return (
    <VentaWizard
      products={products as unknown as Parameters<typeof VentaWizard>[0]["products"]}
      clients={clients}
    />
  )
}
