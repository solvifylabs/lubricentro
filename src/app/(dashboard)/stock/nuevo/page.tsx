"use client"

import { useDemoStore } from "@/lib/demo/store"
import { PageHeader } from "@/components/layout/PageHeader"
import { ProductoForm } from "@/components/stock/ProductoForm"

export default function NuevoProductoPage() {
  const store = useDemoStore()
  const categories = [...store.categorias].sort((a, b) => a.name.localeCompare(b.name))
  const brands = [...store.marcas].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="container">
      <PageHeader title="Nuevo producto" />
      <ProductoForm categories={categories} brands={brands} />
    </div>
  )
}
