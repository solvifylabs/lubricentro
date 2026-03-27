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
import type { Proveedor } from "@/types"

const schema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
})

type FormData = z.infer<typeof schema>

interface ProveedorFormProps {
  supplier?: Proveedor
}

export function ProveedorForm({ supplier }: ProveedorFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!supplier

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: supplier?.name ?? "",
      contactName: supplier?.contactName ?? "",
      phone: supplier?.phone ?? "",
      email: supplier?.email ?? "",
    },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const url = isEditing ? `/api/proveedores/${supplier.id}` : "/api/proveedores"
      const method = isEditing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      toast.success(isEditing ? "Proveedor actualizado" : "Proveedor creado")
      router.push(`/proveedores/${saved.id}`)
      router.refresh()
    } catch {
      toast.error("Error al guardar el proveedor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Nombre *</Label>
              <Input {...register("name")} placeholder="Ej: Distribuidora Norte" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Contacto</Label>
              <Input {...register("contactName")} placeholder="Nombre del vendedor" />
            </div>
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input {...register("phone")} placeholder="+54 299 ..." />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear proveedor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
