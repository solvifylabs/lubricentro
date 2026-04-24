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

export function WashPriceConfig({ currentPrice }: { currentPrice: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState(currentPrice)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch("/api/lava-auto/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ washPrice: price }),
      })
      if (!res.ok) throw new Error()
      toast.success("Precio de lavado actualizado")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Error al actualizar el precio")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5" />
        }
      >
        <Settings2 className="h-3.5 w-3.5" />
        Precio de lavado
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar precio de lavado</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="wash-price">Precio por lavado ($)</Label>
          <Input
            id="wash-price"
            type="number"
            min={0}
            step={100}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Ej: 2000"
            className="text-lg font-bold"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Este precio se usa como valor por defecto al registrar un nuevo lavado.
            Puede modificarse en cada registro.
          </p>
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
