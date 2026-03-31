"use client"

import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import { Package, Users, Wrench, ShoppingCart } from "lucide-react"

const iconMap = { Package, Users, Wrench, ShoppingCart } as const
type IconKey = keyof typeof iconMap

interface StatCard {
  title: string
  value: number
  icon: IconKey
  href: string
  gradient: string
  shadow: string
  trend?: string
  textDark?: boolean
}

interface StatsCardsProps {
  cards: StatCard[]
}

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
}

export function StatsCards({ cards }: StatsCardsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {cards.map((card) => {
        const Icon = iconMap[card.icon]
        const fg = card.textDark ? "text-gray-950" : "text-white"
        const fgMuted = card.textDark ? "text-gray-950/60" : "text-white/70"
        const iconBg = card.textDark ? "bg-black/15" : "bg-white/20"
        return (
          <motion.div key={card.href} variants={item}>
            <Link href={card.href} className="block group">
              <div
                className={`relative overflow-hidden rounded-2xl p-5 ${card.gradient} ${card.shadow} transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl`}
              >
                {/* Background decoration */}
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-6 -left-2 w-20 h-20 rounded-full bg-black/10 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <p className={`text-xs font-semibold ${fgMuted} uppercase tracking-wider`}>
                      {card.title}
                    </p>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${iconBg}`}>
                      <Icon className={`h-4 w-4 ${fg}`} />
                    </div>
                  </div>
                  <p className={`text-4xl font-bold ${fg} tracking-tight`}>{card.value}</p>
                  {card.trend && (
                    <p className={`text-xs ${fgMuted} mt-1.5`}>{card.trend}</p>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
