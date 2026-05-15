"use client"

import { useDemoStore } from "@/lib/demo/store"
import { LavaAutoForm } from "@/components/lava-auto/LavaAutoForm"
import type { WashPrices } from "@/types"

export default function NuevoLavaAutoPage() {
  const store = useDemoStore()

  const products = store.productos
    .filter((p) => p.active && p.stock > 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  const config = store.configLavaAuto
  const washPrices: WashPrices = {
    priceInterior: Number(config.priceInterior),
    priceExterior: Number(config.priceExterior),
    priceIntegro: Number(config.priceIntegro),
  }

  const vehicles = [...store.vehiculos]
    .sort((a, b) => a.plate.localeCompare(b.plate))
    .map((v) => ({
      ...v,
      client: v.clientId ? store.clientes.find((c) => c.id === v.clientId) ?? null : null,
    }))

  return (
    <div className="container flex-1 flex flex-col min-h-0 py-6">
      <LavaAutoForm
        products={products as unknown as Parameters<typeof LavaAutoForm>[0]["products"]}
        washPrices={washPrices}
        vehicles={vehicles as unknown as Parameters<typeof LavaAutoForm>[0]["vehicles"]}
      />
    </div>
  )
}
