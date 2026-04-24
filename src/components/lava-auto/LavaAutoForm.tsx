"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Car, Package, CheckCircle2, ArrowRight, ArrowLeft,
  Plus, Minus, Trash2, Loader2, Check, ChevronLeft,
  Waves, CarFront,
} from "lucide-react"
import type { Producto } from "@/types"

type SesionItem = {
  productId: string
  name: string
  quantity: number
}

const STEPS = [
  { id: 1, label: "Vehículo", icon: Car },
  { id: 2, label: "Productos", icon: Package },
  { id: 3, label: "Resumen", icon: CheckCircle2 },
] as const

type StepId = 1 | 2 | 3

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

export function LavaAutoForm({
  products,
  defaultWashPrice,
  activeTurnoId,
}: {
  products: Producto[]
  defaultWashPrice: number
  activeTurnoId: string | null
}) {
  const router = useRouter()
  const [step, setStep] = useState<StepId>(1)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [plate, setPlate] = useState("")
  const [items, setItems] = useState<SesionItem[]>([])
  const [amount, setAmount] = useState(defaultWashPrice)
  const [notes, setNotes] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [loading, setLoading] = useState(false)

  function goTo(s: StepId) {
    setDirection(s > step ? 1 : -1)
    setStep(s)
  }

  const filteredProducts = products.filter(
    (p) =>
      p.stock > 0 &&
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.code ?? "").toLowerCase().includes(productSearch.toLowerCase()))
  )

  function addProduct(p: Producto) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { productId: p.id, name: p.name, quantity: 1 }]
    })
    setProductSearch("")
  }

  function updateQty(productId: string, qty: number) {
    if (qty < 1) return
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    )
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch("/api/lava-auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: plate.trim() || null,
          amount,
          notes: notes.trim() || null,
          turnoId: activeTurnoId,
          products: items.map(({ productId, quantity }) => ({ productId, quantity })),
        }),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      toast.success("Lavado registrado")
      router.push(`/lava-auto/${saved.id}`)
      router.refresh()
    } catch {
      toast.error("Error al registrar el lavado")
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2 shrink-0">
          <Link href="/lava-auto">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Lava Auto
          </Link>
        </Button>
        <div className="flex items-center gap-2 bg-linear-to-r from-blue-400 to-blue-500 px-4 py-1.5 rounded-xl shadow-md shadow-blue-400/25">
          <Waves className="h-3.5 w-3.5 text-white" />
          <h1 className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
            Nuevo lavado
          </h1>
        </div>
      </div>

      {/* Step indicator */}
      <div className="rounded-2xl border bg-card px-6 py-4 mb-4 flex items-center">
        {STEPS.map((s, i) => {
          const done = step > s.id
          const active = step === s.id
          return (
            <div key={s.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => done && goTo(s.id as StepId)}
                className={cn("flex items-center gap-2.5", done && "cursor-pointer")}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200",
                    done
                      ? "bg-linear-to-r from-blue-400 to-blue-500 text-white"
                      : active
                      ? "bg-linear-to-r from-blue-400 to-blue-500 text-white shadow-md shadow-blue-400/25"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-4 transition-colors duration-300",
                    step > s.id ? "bg-blue-400" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="flex-1 min-h-0"
        >
          {/* ── STEP 1: Vehículo ── */}
          {step === 1 && (
            <div className="rounded-2xl border bg-card overflow-hidden h-full flex flex-col">
              <div className="h-1 bg-linear-to-r from-blue-400 to-blue-500 shrink-0" />
              <div className="px-5 py-3 border-b flex items-center gap-2 shrink-0">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <Car className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <p className="font-semibold text-sm">Identificar vehículo</p>
                {plate && (
                  <span className="ml-auto text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium font-mono uppercase">
                    {plate}
                  </span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-h-0 p-5 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="plate">Patente (opcional)</Label>
                  <Input
                    id="plate"
                    placeholder="Ej: ABC123"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    className="font-mono uppercase text-base tracking-widest"
                    autoFocus
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Podés continuar sin identificar el vehículo.
                  </p>
                </div>

                <div className="flex items-center gap-3 py-4 text-center text-muted-foreground">
                  <div className="flex-1 h-px bg-border" />
                  <CarFront className="h-8 w-8 opacity-20" />
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    onClick={() => { setPlate(""); goTo(2) }}
                  >
                    Sin patente
                  </Button>
                  <Button onClick={() => goTo(2)} className="gap-2">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Productos ── */}
          {step === 2 && (
            <div className="rounded-2xl border bg-card overflow-hidden h-full flex flex-col">
              <div className="h-1 bg-linear-to-r from-blue-400 to-blue-500 shrink-0" />
              <div className="px-5 py-3 border-b flex items-center gap-2 shrink-0">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <Package className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <p className="font-semibold text-sm">Productos utilizados</p>
                {items.length > 0 && (
                  <span className="ml-auto text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                    {items.length} producto{items.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-h-0 p-5 gap-4">
                <div className="relative">
                  <Input
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    autoFocus
                  />
                  {productSearch && (
                    <div className="absolute top-full mt-1.5 left-0 right-0 z-20 bg-card border rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {filteredProducts.slice(0, 8).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProduct(p)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-muted/60 flex items-center justify-between transition-colors first:rounded-t-xl last:rounded-b-xl border-b last:border-b-0"
                        >
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Stock: {p.stock}
                              {p.expectedConsumptionPerWash != null && (
                                <> · Esperado: {Number(p.expectedConsumptionPerWash)} por lavado</>
                              )}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">Sin resultados</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm border border-dashed rounded-xl">
                      Buscá y agregá los productos usados en este lavado
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-muted/30"
                        >
                          <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button" variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => updateQty(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-mono font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <Button
                              type="button" variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => updateQty(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => goTo(1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </Button>
                  <Button onClick={() => goTo(3)} className="gap-2">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Resumen ── */}
          {step === 3 && (
            <div className="rounded-2xl border bg-card overflow-hidden h-full flex flex-col">
              <div className="h-1 bg-linear-to-r from-blue-400 to-blue-500 shrink-0" />
              <div className="px-5 py-3 border-b flex items-center gap-2 shrink-0">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <p className="font-semibold text-sm">Confirmar lavado</p>
              </div>
              <div className="flex flex-col flex-1 min-h-0 p-5 gap-4">
                <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
                  {/* Vehicle summary */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0">
                      <Car className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vehículo</p>
                      <p className="text-sm font-semibold font-mono">
                        {plate || "Anónimo"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goTo(1)}
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>

                  {/* Products summary */}
                  {items.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-1">
                        Productos utilizados
                      </p>
                      {items.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between text-sm px-1">
                          <span className="font-medium truncate">{item.name}</span>
                          <span className="text-muted-foreground shrink-0 ml-4 tabular-nums">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {items.length === 0 && (
                    <p className="text-sm text-muted-foreground px-1">Sin productos registrados.</p>
                  )}

                  <Separator />

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Precio del lavado ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min={0}
                      step={100}
                      value={amount || ""}
                      placeholder="0"
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-40 text-lg font-bold"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Observaciones (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Notas sobre el lavado..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-between font-bold text-2xl px-1 pt-1">
                    <span>Total</span>
                    <span className="tabular-nums">${amount.toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => goTo(2)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="gap-2 bg-linear-to-r from-blue-400 to-blue-500 text-white shadow-md shadow-blue-400/25 hover:opacity-90 transition-opacity"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Confirmar lavado
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
