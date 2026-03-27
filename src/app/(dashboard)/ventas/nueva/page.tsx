export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { VentaWizard } from "@/components/ventas/VentaWizard"

export default async function NuevaVentaPage() {
  const [products, clients] = await Promise.all([
    prisma.producto.findMany({
      where: { active: true, stock: { gt: 0 } },
      orderBy: { name: "asc" },
    }),
    prisma.cliente.findMany({
      where: { active: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ])

  return <VentaWizard products={products} clients={clients} />
}
