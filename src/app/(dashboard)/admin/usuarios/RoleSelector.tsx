"use client"

import { useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { Role } from "@/lib/auth/roles"

type Props = {
  userId: string
  currentRole: Role | null
}

export function RoleSelector({ userId, currentRole }: Props) {
  const [pending, startTransition] = useTransition()

  function handleChange(role: Role) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/usuarios/${userId}/rol`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      if (!res.ok) {
        toast.error("No se pudo actualizar el rol.")
        return
      }

      toast.success("Rol actualizado correctamente.")
    })
  }

  if (currentRole) {
    return (
      <Select
        defaultValue={currentRole}
        onValueChange={(v) => handleChange(v as Role)}
        disabled={pending}
      >
        <SelectTrigger className="h-7 w-32 text-xs bg-gray-800/60 border-white/8 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="owner">owner</SelectItem>
          <SelectItem value="admin">admin</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs text-gray-500 border-white/8">
        Sin rol
      </Badge>
      <Select onValueChange={(v) => handleChange(v as Role)} disabled={pending}>
        <SelectTrigger className="h-7 w-28 text-xs bg-gray-800/60 border-white/8 text-gray-400">
          <SelectValue placeholder="Asignar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="owner">owner</SelectItem>
          <SelectItem value="admin">admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
