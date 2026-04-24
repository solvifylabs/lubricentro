export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { LavaAutoForm } from "@/components/lava-auto/LavaAutoForm"

function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function todayEnd() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

export default async function NuevoLavaAutoPage() {
  const [products, config, activeTurno] = await Promise.all([
    prisma.producto.findMany({
      where: { active: true, stock: { gt: 0 } },
      orderBy: { name: "asc" },
    }),
    prisma.configLavaAuto.findFirst(),
    prisma.turnoLavaAuto.findFirst({
      where: {
        endedAt: null,
        startedAt: { gte: todayStart(), lte: todayEnd() },
      },
    }),
  ])

  const washPrice = config ? Number(config.washPrice) : 0

  return (
    <div className="container flex-1 flex flex-col min-h-0 py-6">
      <LavaAutoForm
        products={products}
        defaultWashPrice={washPrice}
        activeTurnoId={activeTurno?.id ?? null}
      />
    </div>
  )
}
