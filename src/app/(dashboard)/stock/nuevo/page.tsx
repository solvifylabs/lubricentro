export const dynamic = 'force-dynamic'

import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/layout/PageHeader"
import { ProductoForm } from "@/components/stock/ProductoForm"

export default async function NuevoProductoPage() {
  const [categories, brands] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { name: "asc" } }),
    prisma.marca.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="container">
      <PageHeader title="Nuevo producto" />
      <ProductoForm categories={categories} brands={brands} />
    </div>
  )
}
