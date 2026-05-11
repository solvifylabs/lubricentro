"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Loader2, AlertCircle, Users, Car, Wrench, BarChart2 } from "lucide-react"

const features = [
  { icon: Users, label: "Gestión de clientes en tiempo real" },
  { icon: Car, label: "Historial de vehículos y servicios" },
  { icon: Wrench, label: "Control de trabajos y mantenimiento" },
  { icon: BarChart2, label: "Reportes de ventas y operaciones" },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError("No se pudo conectar con Google. Intentá nuevamente.")
      setGoogleLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
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
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 bg-[#070c14] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black border border-white/15 shrink-0">
            <Image src="/logo.webp" alt="Solvify" width={20} height={20} />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Lubricentro</span>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestión simple.<br />
            <span className="text-gray-500">Taller en orden.</span>
          </h1>
          <p className="text-gray-500 text-sm mb-10 max-w-xs leading-relaxed">
            Sistema de gestión para lubricentros. Clientes, vehículos, servicios y más — todo en un solo lugar.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/5 border border-white/8">
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <span className="text-gray-400 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-xs relative z-10">
          © 2026 Lubricentro · Powered by Solvify
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0f1117]">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Bienvenido</h2>
            <p className="text-gray-500 text-sm mt-1">Ingresá tus credenciales para continuar.</p>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-11 bg-white hover:bg-gray-100 text-gray-900 font-semibold border-0 rounded-full mb-4"
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continuar con Google
          </Button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0f1117] px-2 text-gray-600">o</span>
            </div>
          </div>

          {/* Form */}
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
                className="bg-[#1a1d24] border-white/8 text-white placeholder:text-gray-600 focus-visible:ring-0 focus-visible:border-white/20 h-11 rounded-full px-4"
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
                className="bg-[#1a1d24] border-white/8 text-white placeholder:text-gray-600 focus-visible:ring-0 focus-visible:border-white/20 h-11 rounded-full px-4"
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
              className="w-full h-11 bg-white hover:bg-gray-100 text-gray-900 font-semibold border-0 rounded-full"
              disabled={loading || googleLoading}
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
    </div>
  )
}
