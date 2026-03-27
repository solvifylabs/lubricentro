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
import type { Cliente } from "@/types"

const schema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  dni: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ClienteFormProps {
  client?: Cliente
}

export function ClienteForm({ client }: ClienteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!client

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: client?.firstName ?? "",
      lastName: client?.lastName ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      dni: client?.dni ?? "",
    },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const url = isEditing ? `/api/clientes/${client.id}` : "/api/clientes"
      const method = isEditing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      toast.success(isEditing ? "Cliente actualizado" : "Cliente creado")
      router.push(`/clientes/${saved.id}`)
      router.refresh()
    } catch {
      toast.error("Error al guardar el cliente")
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
              <Label>Nombre *</Label>
              <Input {...register("firstName")} placeholder="Juan" />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Apellido</Label>
              <Input {...register("lastName")} placeholder="García" />
            </div>
            <div className="space-y-1">
              <Label>Teléfono / WhatsApp</Label>
              <Input {...register("phone")} placeholder="+54 299 4000000" />
            </div>
            <div className="space-y-1">
              <Label>DNI</Label>
              <Input {...register("dni")} placeholder="30123456" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Email</Label>
              <Input type="email" {...register("email")} placeholder="juan@email.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
