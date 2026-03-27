export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/layout/PageHeader"
import { VehiculoForm } from "@/components/vehiculos/VehiculoForm"

export default async function NuevoVehiculoPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const { clientId } = await searchParams

  const clients = await prisma.cliente.findMany({
    where: { active: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  })

  return (
    <div className="max-w-xl">
      <PageHeader title="Nuevo vehículo" />
      <VehiculoForm clients={clients} defaultClientId={clientId} />
    </div>
  )
}
