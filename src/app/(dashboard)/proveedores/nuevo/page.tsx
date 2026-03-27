import { PageHeader } from "@/components/layout/PageHeader"
import { ProveedorForm } from "@/components/proveedores/ProveedorForm"

export default function NuevoProveedorPage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Nuevo proveedor" />
      <ProveedorForm />
    </div>
  )
}
