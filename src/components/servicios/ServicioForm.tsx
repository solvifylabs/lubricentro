"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"
import type { Cliente, Vehiculo, Producto } from "@/types"

const schema = z.object({
  vehicleId: z.string().min(1, "Vehículo requerido"),
  clientId: z.string().optional(),
  mileage: z.coerce.number().int().min(0).optional().or(z.literal("")),
  nextServiceKm: z.coerce.number().int().min(0).optional().or(z.literal("")),
  serviceDate: z.string().min(1),
  nextServiceDate: z.string().optional(),
  amount: z.coerce.number().min(0),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ProductItem {
  productId: string
  name: string
  quantity: number
  price: number
}

interface ServicioFormProps {
  vehicles: Vehiculo[]
  clients: Pick<Cliente, "id" | "firstName" | "lastName">[]
  products: Producto[]
  defaultVehicleId?: string
  defaultClientId?: string
}

export function ServicioForm({
  vehicles,
  clients,
  products,
  defaultVehicleId,
  defaultClientId,
}: ServicioFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ProductItem[]>([])
  const [productSearch, setProductSearch] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      vehicleId: defaultVehicleId ?? "",
      clientId: defaultClientId ?? "",
      serviceDate: today,
      amount: 0,
    },
  })

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.code ?? "").toLowerCase().includes(productSearch.toLowerCase())
  )

  function addProduct(product: Producto) {
    if (items.find((i) => i.productId === product.id)) return
    setItems((prev) => [
      ...prev,
      { productId: product.id, name: product.name, quantity: 1, price: Number(product.sellPrice) },
    ])
    setProductSearch("")
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function updateItemQty(productId: string, qty: number) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    )
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await fetch("/api/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, products: items }),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      toast.success("Servicio registrado")
      router.push(`/servicios/${saved.id}`)
      router.refresh()
    } catch {
      toast.error("Error al guardar el servicio")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Vehicle & client */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehículo y cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Vehículo *</Label>
            <select
              {...register("vehicleId")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">Seleccionar vehículo</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.brand} {v.model}
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Cliente</Label>
            <select
              {...register("clientId")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">Sin cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName ?? ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Kilometraje</Label>
            <Input type="number" {...register("mileage")} placeholder="Ej: 85000" />
          </div>

          <div className="space-y-1">
            <Label>Km próximo service</Label>
            <Input type="number" {...register("nextServiceKm")} placeholder="Ej: 90000" />
          </div>

          <div className="space-y-1">
            <Label>Fecha del service</Label>
            <Input type="date" {...register("serviceDate")} />
          </div>

          <div className="space-y-1">
            <Label>Fecha próximo service</Label>
            <Input type="date" {...register("nextServiceDate")} />
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Observaciones</Label>
            <Textarea {...register("notes")} rows={2} placeholder="Filtro de aceite, aceite 10W40, etc." />
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Productos utilizados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Input
              placeholder="Buscar producto..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            {productSearch && (
              <div className="absolute top-10 z-10 w-full bg-background border rounded-md shadow-md max-h-48 overflow-y-auto">
                {filteredProducts.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between"
                  >
                    <span>{p.name}</span>
                    <Badge variant="secondary">{p.stock} {p.unit}</Badge>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</p>
                )}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <span className="flex-1 text-sm">{item.name}</span>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItemQty(item.productId, Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground w-20 text-right">
                    ${(item.price * item.quantity).toLocaleString("es-AR")}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Label className="w-32">Monto total *</Label>
            <Input
              type="number"
              step="0.01"
              {...register("amount")}
              className="max-w-40"
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar servicio
        </Button>
      </div>
    </form>
  )
}
