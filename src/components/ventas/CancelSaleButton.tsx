"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function CancelSaleButton({ saleId }: { saleId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try {
      const res = await fetch(`/api/ventas/${saleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })
      if (!res.ok) throw new Error()
      toast.success("Venta anulada")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Error al anular la venta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center rounded-lg h-8 gap-1.5 px-2.5 text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
      >
        Anular venta
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Anular esta venta?</DialogTitle>
          <DialogDescription>
            Esta acción no revierte el stock automáticamente. Podés ajustarlo
            manualmente desde el módulo de stock.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Anular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
