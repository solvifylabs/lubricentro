import { createAdminClient } from "@/lib/supabase/admin"
import type { Role } from "@/lib/auth/roles"
import { Users } from "lucide-react"
import { RoleSelector } from "./RoleSelector"

export default async function AdminUsuariosPage() {
  const { data, error } = await createAdminClient().auth.admin.listUsers()

  if (error) {
    return (
      <p className="text-sm text-red-400">
        No se pudieron cargar los usuarios.
      </p>
    )
  }

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "(sin email)",
    role: (u.app_metadata?.role as Role) ?? null,
    createdAt: u.created_at,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-yellow-400" />
        <div>
          <h1 className="text-lg font-semibold text-white">Usuarios</h1>
          <p className="text-xs text-gray-500">Gestión de roles de acceso</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-gray-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-xs text-gray-500">
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Creado</th>
              <th className="text-left px-4 py-3 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white font-mono text-xs">
                  {u.email}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <RoleSelector userId={u.id} currentRole={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
