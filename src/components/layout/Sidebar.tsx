"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Package,
  Users,
  Car,
  Wrench,
  ShoppingCart,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Droplets,
  Waves,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/vehiculos", label: "Vehículos", icon: Car },
  { href: "/servicios", label: "Servicios", icon: Wrench },
  { href: "/lava-auto", label: "Lava Auto", icon: Waves },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-950 border-r border-white/5 shadow-[2px_0_16px_0_rgb(0,0,0,0.18)]">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-yellow-400 shadow-lg shadow-yellow-400/25">
            <Droplets className="h-5 w-5 text-gray-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Lavalle</h1>
            <p className="text-[11px] text-gray-500 leading-none mt-0.5">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }, i) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
            >
              <Link
                href={href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-gray-950"
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-yellow-400 shadow-md shadow-yellow-400/20"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon className="relative h-4 w-4 shrink-0" />
                <span className="relative">{label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
