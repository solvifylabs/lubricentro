import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Clock, Droplets, LogOut } from "lucide-react"

async function signOut() {
  "use server"
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export default async function PendingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-400 shadow-xl shadow-yellow-400/30 mb-4">
          <Droplets className="h-7 w-7 text-gray-950" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Lavalle</h1>
        <p className="text-sm text-gray-500 mt-1">Sistema de Gestión</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/8 bg-gray-900/80 backdrop-blur-sm shadow-2xl p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 mx-auto mb-4">
          <Clock className="h-5 w-5 text-yellow-400" />
        </div>

        <h2 className="text-base font-semibold text-white mb-1">
          Cuenta pendiente de aprobación
        </h2>
        <p className="text-xs text-gray-500 mb-1">
          Tu cuenta fue creada correctamente.
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Un administrador asignará tu rol a la brevedad.
        </p>

        <p className="text-xs text-gray-600 mb-6 font-mono truncate">
          {user.email}
        </p>

        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
