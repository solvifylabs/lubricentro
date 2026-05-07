"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Settings2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { WashPrices } from "@/types"

const WASH_FIELDS: { key: keyof WashPrices; label: string }[] = [
  { key: "priceIntegro", label: "Lavado íntegro (interior + exterior)" },
  { key: "priceExterior", label: "Lavado exterior" },
  { key: "priceInterior", label: "Lavado interior" },
]

export function WashPriceConfig({ prices }: { prices: WashPrices }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<WashPrices>(prices)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch("/api/lava-auto/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error()
      toast.success("Precios actualizados")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Error al actualizar precios")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <Settings2 className="h-3.5 w-3.5" />
        Precios de lavado
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar precios por tipo de lavado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {WASH_FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label>{label} ($)</Label>
              <Input
                type="number"
                min={0}
                step={100}
                value={values[key] || ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                placeholder="Ej: 2000"
                className="text-lg font-bold"
              />
            </div>
          ))}
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
