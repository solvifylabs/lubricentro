export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/layout/PageHeader"
import { ServicioForm } from "@/components/servicios/ServicioForm"

export default async function NuevoServicioPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string; clientId?: string }>
}) {
  const { vehicleId, clientId } = await searchParams

  const [vehicles, clients, products] = await Promise.all([
    prisma.vehiculo.findMany({ orderBy: { plate: "asc" } }),
    prisma.cliente.findMany({
      where: { active: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.producto.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="container">
      <PageHeader title="Nuevo servicio" />
      <ServicioForm
        vehicles={vehicles}
        clients={clients}
        products={products}
        defaultVehicleId={vehicleId}
        defaultClientId={clientId}
      />
    </div>
  )
}
