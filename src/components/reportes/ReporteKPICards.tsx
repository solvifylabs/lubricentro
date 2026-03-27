"use client"

import { motion, type Variants } from "framer-motion"
import { TrendingUp, Wrench, DollarSign, PackageX } from "lucide-react"

interface KPI {
  label: string
  value: string
  sub: string
  gradient: string
  shadow: string
  icon: "TrendingUp" | "Wrench" | "DollarSign" | "PackageX"
}

const iconMap = { TrendingUp, Wrench, DollarSign, PackageX }

interface ReporteKPICardsProps {
  cards: KPI[]
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
}

export function ReporteKPICards({ cards }: ReporteKPICardsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => {
        const Icon = iconMap[card.icon]
        return (
          <motion.div key={card.label} variants={item}>
            <div
              className={`relative overflow-hidden rounded-2xl p-5 ${card.gradient} ${card.shadow}`}
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-6 -left-2 w-20 h-20 rounded-full bg-black/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white tracking-tight">{card.value}</p>
                <p className="text-xs text-white/60 mt-1">{card.sub}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
