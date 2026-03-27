import { PageHeader } from "@/components/layout/PageHeader"
import { ClienteForm } from "@/components/clientes/ClienteForm"

export default function NuevoClientePage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Nuevo cliente" />
      <ClienteForm />
    </div>
  )
}
