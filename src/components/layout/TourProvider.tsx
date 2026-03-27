"use client"

import { NextStepProvider, NextStep } from "nextstepjs"
import { tours } from "@/lib/tours"

export function TourProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextStepProvider>
      <NextStep
        steps={tours}
        shadowRgb="15, 23, 42"
        shadowOpacity="0.6"
        cardTransition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
      >
        {children}
      </NextStep>
    </NextStepProvider>
  )
}
