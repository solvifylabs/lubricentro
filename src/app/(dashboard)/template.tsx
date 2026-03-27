"use client"

import { motion } from "framer-motion"

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.36, 0.07, 0.19, 0.97] }}
    >
      {children}
    </motion.div>
  )
}
