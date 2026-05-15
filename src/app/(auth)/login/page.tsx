"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Users, Car, Wrench, BarChart2, ArrowRight } from "lucide-react"

const features = [
  { icon: Users, label: "Gestión de clientes en tiempo real" },
  { icon: Car, label: "Historial de vehículos y servicios" },
  { icon: Wrench, label: "Control de trabajos y mantenimiento" },
  { icon: BarChart2, label: "Reportes de ventas y operaciones" },
]

export default function LoginPage() {
  const router = useRouter()

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
        <div className="w-full max-w-sm text-center">
          {/* Demo badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            Modo Demo
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Explorá el sistema
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Esta es una versión de demostración con datos de ejemplo.<br />
            Los cambios que realices se pierden al cerrar la pestaña.
          </p>

          <Button
            onClick={() => router.push("/")}
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-semibold border-0 rounded-full text-base gap-2"
          >
            Entrar al demo
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-gray-600 text-xs mt-6">
            Sin registro · Sin contraseña · Sin datos reales
          </p>
        </div>
      </div>
    </div>
  )
}
