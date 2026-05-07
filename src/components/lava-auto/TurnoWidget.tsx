"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Waves, Play, Square, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type Turno = {
  id: string
  startedAt: string
  endedAt: string | null
  _count: { sessions: number }
}

export function TurnoWidget() {
  const [turno, setTurno] = useState<Turno | null | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  const fetchTurno = useCallback(async () => {
    const res = await fetch("/api/lava-auto/turno")
    const data = await res.json()
    setTurno(data)
  }, [])

  useEffect(() => {
    fetchTurno()
  }, [fetchTurno])

  async function startTurno() {
    setLoading(true)
    try {
      const res = await fetch("/api/lava-auto/turno", { method: "POST" })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Error al iniciar turno")
        return
      }
      await fetchTurno()
      toast.success("Turno iniciado")
    } finally {
      setLoading(false)
    }
  }

  async function endTurno() {
    if (!turno) return
    setLoading(true)
    try {
      await fetch("/api/lava-auto/turno", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: turno.id }),
      })
      await fetchTurno()
      toast.success("Turno cerrado")
    } finally {
      setLoading(false)
    }
  }

  if (turno === undefined) {
    return (
      <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3 animate-pulse">
        <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>
    )
  }

  if (!turno) {
    return (
      <div className="rounded-xl border bg-card px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <Waves className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium">Turno Lava Auto</p>
            <p className="text-xs text-muted-foreground">Sin turno activo hoy</p>
          </div>
        </div>
        <Button size="sm" onClick={startTurno} disabled={loading} className="gap-1.5 shrink-0">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Iniciar turno
        </Button>
      </div>
    )
  }

  const startTime = format(new Date(turno.startedAt), "HH:mm", { locale: es })
  const washCount = turno._count.sessions

  return (
    <div className="rounded-xl border border-green-500/20 bg-green-50/50 dark:bg-green-500/5 px-4 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 dark:bg-green-500/15 shrink-0">
          <Waves className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-green-800 dark:text-green-300">Turno activo desde {startTime}</p>
          <p className="text-xs text-green-600 dark:text-green-500">
            {washCount} lavado{washCount !== 1 ? "s" : ""} registrado{washCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={endTurno}
        disabled={loading}
        className="gap-1.5 shrink-0 border-green-200 text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-400"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
        Cerrar turno
      </Button>
    </div>
  )
}
