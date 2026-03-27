"use client"

import { useNextStep } from "nextstepjs"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

export function HelpButton({ tourName }: { tourName: string }) {
  const { startNextStep } = useNextStep()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => startNextStep(tourName)}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <HelpCircle className="h-3.5 w-3.5" />
      Ayuda
    </Button>
  )
}
