"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { Categoria, Marca, Producto } from "@/types"

const schema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  code: z.string().optional(),
  categoryId: z.string().min(1, "Categoría requerida"),
  brandId: z.string().optional(),
  buyPrice: z.coerce.number().min(0),
  sellPrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0),
  unit: z.string().min(1),
  expectedConsumptionPerWash: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0).optional()
  ),
})

type FormData = z.infer<typeof schema>

interface ProductoFormProps {
  categories: Categoria[]
  brands: Marca[]
  product?: Producto
}

export function ProductoForm({ categories, brands, product }: ProductoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!product

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: product?.name ?? "",
      code: product?.code ?? "",
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      buyPrice: product ? Number(product.buyPrice) : 0,
      sellPrice: product ? Number(product.sellPrice) : 0,
      stock: product?.stock ?? 0,
      minStock: product?.minStock ?? 5,
      unit: product?.unit ?? "unidad",
      expectedConsumptionPerWash: product?.expectedConsumptionPerWash
        ? Number(product.expectedConsumptionPerWash)
        : undefined,
    },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const url = isEditing ? `/api/stock/${product.id}` : "/api/stock"
      const method = isEditing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error()
      toast.success(isEditing ? "Producto actualizado" : "Producto creado")
      router.push("/stock")
      router.refresh()
    } catch {
      toast.error("Error al guardar el producto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Nombre *</Label>
              <Input {...register("name")} placeholder="Ej: Aceite 10W40" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Código</Label>
              <Input {...register("code")} placeholder="Ej: ACT-001" />
            </div>

            <div className="space-y-1">
              <Label>Unidad</Label>
              <Input {...register("unit")} placeholder="unidad, litro, kg..." />
            </div>

            <div className="space-y-1">
              <Label>Categoría *</Label>
              <Select
                defaultValue={product?.categoryId ?? ""}
                onValueChange={(v: string | null) => setValue("categoryId", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Marca</Label>
              <Select
                defaultValue={product?.brandId ?? ""}
                onValueChange={(v: string | null) => setValue("brandId", v ?? undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin marca</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Precio de compra</Label>
              <Input type="number" step="0.01" {...register("buyPrice")} />
            </div>

            <div className="space-y-1">
              <Label>Precio de venta</Label>
              <Input type="number" step="0.01" {...register("sellPrice")} />
            </div>

            {!isEditing && (
              <div className="space-y-1">
                <Label>Stock inicial</Label>
                <Input type="number" {...register("stock")} />
              </div>
            )}

            <div className="space-y-1">
              <Label>Stock mínimo</Label>
              <Input type="number" {...register("minStock")} />
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Consumo esperado por lavado — Lava Auto</Label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                placeholder="Ej: 0.05 (opcional)"
                {...register("expectedConsumptionPerWash")}
              />
              <p className="text-xs text-muted-foreground">
                Cantidad de este producto esperada por cada lavado. Se usa para detectar desvíos de consumo.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
