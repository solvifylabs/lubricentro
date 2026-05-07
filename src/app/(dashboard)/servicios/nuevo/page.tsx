export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/layout/PageHeader"
import { ServicioForm } from "@/components/servicios/ServicioForm"

export default async function NuevoServicioPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string }>
}) {
  const { vehicleId } = await searchParams

  const [vehicles, products, serviceConfig] = await Promise.all([
    prisma.vehiculo.findMany({
      orderBy: { plate: "asc" },
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.producto.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.configServicio.findFirst(),
  ])

  const defaultServicePrice = serviceConfig ? Number(serviceConfig.servicePrice) : 0

  return (
    <div className="container">
      <PageHeader title="Nuevo servicio" />
      <ServicioForm
        vehicles={vehicles}
        products={products}
        defaultVehicleId={vehicleId}
        defaultServicePrice={defaultServicePrice}
      />
    </div>
  )
}
