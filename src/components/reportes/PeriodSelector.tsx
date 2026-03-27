"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const PERIODS = [
  { value: "week", label: "1 semana" },
  { value: "month", label: "1 mes" },
  { value: "year", label: "1 año" },
  { value: "custom", label: "Personalizado" },
]

interface PeriodSelectorProps {
  currentPeriod: string
  currentFrom?: string
  currentTo?: string
}

export function PeriodSelector({ currentPeriod, currentFrom, currentTo }: PeriodSelectorProps) {
  const router = useRouter()

  const [range, setRange] = useState<DateRange | undefined>(
    currentFrom && currentTo
      ? { from: new Date(currentFrom + "T12:00:00"), to: new Date(currentTo + "T12:00:00") }
      : undefined
  )

  function navigate(period: string) {
    if (period !== "custom") {
      router.push(`/reportes?period=${period}`)
    }
  }

  function handleRangeSelect(r: DateRange | undefined) {
    setRange(r)
    if (r?.from && r?.to) {
      const from = format(r.from, "yyyy-MM-dd")
      const to = format(r.to, "yyyy-MM-dd")
      router.push(`/reportes?period=custom&from=${from}&to=${to}`)
    }
  }

  const dateLabel =
    range?.from && range?.to
      ? `${format(range.from, "d MMM", { locale: es })} – ${format(range.to, "d MMM yyyy", { locale: es })}`
      : range?.from
        ? format(range.from, "d MMM yyyy", { locale: es })
        : "Elegir fechas"

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Period pill buttons */}
      <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => navigate(p.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
              currentPeriod === p.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range picker */}
      {currentPeriod === "custom" && (
        <Popover>
          <PopoverTrigger
            className={cn(buttonVariants({ variant: "outline" }), "h-9 gap-2 text-sm font-normal")}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {dateLabel}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
