"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, Trash2, Plus, Minus } from "lucide-react"
import type { Producto, Cliente } from "@/types"

interface CartItem {
  productId: string
  name: string
  quantity: number
  price: number
  maxStock: number
}

interface VentaCartProps {
  products: Producto[]
  clients: Pick<Cliente, "id" | "firstName" | "lastName">[]
}

export function VentaCart({ products, clients }: VentaCartProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [clientId, setClientId] = useState("")
  const [discount, setDiscount] = useState(0)

  const filtered = products.filter(
    (p) =>
      p.stock > 0 &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.code ?? "").toLowerCase().includes(search.toLowerCase()))
  )

  function addProduct(product: Producto) {
    const existing = items.find((i) => i.productId === product.id)
    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === product.id && i.quantity < i.maxStock
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      )
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          price: Number(product.sellPrice),
          maxStock: product.stock,
        },
      ])
    }
    setSearch("")
  }

  function updateQty(productId: string, qty: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) }
          : i
      )
    )
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const total = Math.max(0, subtotal - discount)

  async function handleSubmit() {
    if (items.length === 0) {
      toast.error("Agregá al menos un producto")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          items: items.map(({ productId, quantity, price }) => ({ productId, quantity, price })),
          discount,
        }),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      toast.success("Venta registrada")
      router.push(`/ventas/${saved.id}`)
      router.refresh()
    } catch {
      toast.error("Error al registrar la venta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product search */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buscar productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <div className="mt-2 border rounded-md max-h-64 overflow-y-auto">
                {filtered.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${Number(p.sellPrice).toLocaleString("es-AR")} · Stock: {p.stock}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente (opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">Venta sin cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName ?? ""}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Carrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Buscá y agregá productos
            </p>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.price.toLocaleString("es-AR")} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-sm font-semibold w-20 text-right">
                    ${(item.price * item.quantity).toLocaleString("es-AR")}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}

              <Separator />

              <div className="flex items-center gap-2">
                <Label className="w-24 text-sm">Descuento</Label>
                <Input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-28 h-8"
                />
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-AR")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>Descuento</span>
                  <span>- ${discount.toLocaleString("es-AR")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
            </>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="w-full mt-2"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar venta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
