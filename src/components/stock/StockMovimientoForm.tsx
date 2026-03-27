"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface StockMovimientoFormProps {
  productId: string
  productName: string
}

export function StockMovimientoForm({ productId, productName }: StockMovimientoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState("entry")
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/stock/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, type, quantity, reason }),
      })
      if (!res.ok) throw new Error()
      toast.success("Movimiento registrado")
      router.refresh()
      setQuantity(1)
      setReason("")
    } catch {
      toast.error("Error al registrar el movimiento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">Producto: <strong>{productName}</strong></p>

          <div className="space-y-1">
            <Label>Tipo de movimiento</Label>
            <Select value={type} onValueChange={(v: string | null) => v && setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Ingreso</SelectItem>
                <SelectItem value="exit">Egreso</SelectItem>
                <SelectItem value="adjustment">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Cantidad</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Motivo</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Compra, uso en servicio, ajuste de inventario..."
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar movimiento
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
