export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { LavaAutoForm } from "@/components/lava-auto/LavaAutoForm"
import type { WashPrices } from "@/types"

export default async function NuevoLavaAutoPage() {
  const [products, config, vehicles] = await Promise.all([
    prisma.producto.findMany({
      where: { active: true, stock: { gt: 0 } },
      orderBy: { name: "asc" },
    }),
    prisma.configLavaAuto.findFirst(),
    prisma.vehiculo.findMany({
      include: { client: true },
      orderBy: { plate: "asc" },
    }),
  ])

  const washPrices: WashPrices = config
    ? {
        priceInterior: Number(config.priceInterior),
        priceExterior: Number(config.priceExterior),
        priceIntegro: Number(config.priceIntegro),
      }
    : { priceInterior: 0, priceExterior: 0, priceIntegro: 0 }

  return (
    <div className="container flex-1 flex flex-col min-h-0 py-6">
      <LavaAutoForm products={products} washPrices={washPrices} vehicles={vehicles} />
    </div>
  )
}
