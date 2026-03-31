"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Droplets, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Credenciales inválidas. Verificá tu email y contraseña.")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

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
      <div className="rounded-2xl border border-white/8 bg-gray-900/80 backdrop-blur-sm shadow-2xl p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-white">Iniciar sesión</h2>
          <p className="text-xs text-gray-500 mt-0.5">Ingresá tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-gray-400">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@lubricentro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800/60 border-white/8 text-white placeholder:text-gray-600 focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400/50 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-gray-400">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-800/60 border-white/8 text-white placeholder:text-gray-600 focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400/50 h-10"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5">
              <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-10 bg-yellow-400 hover:bg-yellow-300 transition-colors text-gray-950 font-semibold shadow-lg shadow-yellow-400/25 border-0"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
