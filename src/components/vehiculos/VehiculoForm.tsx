"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Vehiculo, Cliente } from "@/types"

const schema = z.object({
  plate: z.string().min(1, "Dominio requerido"),
  brand: z.string().min(1, "Marca requerida"),
  model: z.string().min(1, "Modelo requerido"),
  year: z.coerce.number().int().min(1900, "Año requerido").max(2100),
  engine: z.string().min(1, "Motor requerido"),
  clientId: z.string().min(1, "Cliente requerido"),
})

type FormData = z.infer<typeof schema>

interface VehiculoFormProps {
  vehicle?: Vehiculo
  clients?: Pick<Cliente, "id" | "firstName" | "lastName">[]
  defaultClientId?: string
}

export function VehiculoForm({ vehicle, clients = [], defaultClientId }: VehiculoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!vehicle

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      plate: vehicle?.plate ?? "",
      brand: vehicle?.brand ?? "",
      model: vehicle?.model ?? "",
      year: vehicle?.year ?? undefined,
      engine: vehicle?.engine ?? "",
      clientId: vehicle?.clientId ?? defaultClientId ?? "",
    },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const url = isEditing ? `/api/vehiculos/${vehicle.id}` : "/api/vehiculos"
      const method = isEditing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      toast.success(isEditing ? "Vehículo actualizado" : "Vehículo creado")
      router.push(`/vehiculos/${saved.id}`)
      router.refresh()
    } catch {
      toast.error("Error al guardar el vehículo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Dominio *</Label>
              <Input {...register("plate")} placeholder="ABC123" className="uppercase" />
              {errors.plate && <p className="text-xs text-destructive">{errors.plate.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Año *</Label>
              <Input type="number" {...register("year")} placeholder="2020" />
              {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Marca *</Label>
              <Input {...register("brand")} placeholder="Toyota" />
              {errors.brand && <p className="text-xs text-destructive">{errors.brand.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Modelo *</Label>
              <Input {...register("model")} placeholder="Corolla" />
              {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Motor *</Label>
              <Input {...register("engine")} placeholder="1.8 nafta" />
              {errors.engine && <p className="text-xs text-destructive">{errors.engine.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Cliente *</Label>
              <select
                {...register("clientId")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName ?? ""}
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear vehículo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
