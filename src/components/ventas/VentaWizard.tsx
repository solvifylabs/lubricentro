"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  User, Package, CheckCircle2, ArrowRight, ArrowLeft,
  Plus, Minus, Trash2, Loader2, UserX, Check, ChevronLeft,
  ShoppingCart,
} from "lucide-react"
import type { Producto, Cliente } from "@/types"

type ClientRow = Pick<Cliente, "id" | "firstName" | "lastName">

interface CartItem {
  productId: string
  name: string
  quantity: number
  price: number
  maxStock: number
}

const STEPS = [
  { id: 1, label: "Cliente", icon: User },
  { id: 2, label: "Productos", icon: Package },
  { id: 3, label: "Resumen", icon: CheckCircle2 },
] as const

type StepId = 1 | 2 | 3

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

export function VentaWizard({
  products,
  clients,
}: {
  products: Producto[]
  clients: ClientRow[]
}) {
  const router = useRouter()
  const [step, setStep] = useState<StepId>(1)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [clientSearch, setClientSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [loading, setLoading] = useState(false)

  function goTo(s: StepId) {
    setDirection(s > step ? 1 : -1)
    setStep(s)
  }

  const filteredClients = clients.filter((c) =>
    `${c.firstName} ${c.lastName ?? ""}`.toLowerCase().includes(clientSearch.toLowerCase())
  )

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
          i.productId === p.id && i.quantity < i.maxStock
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          quantity: 1,
          price: Number(p.sellPrice),
          maxStock: p.stock,
        },
      ]
    })
    setProductSearch("")
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

  async function handleConfirm() {
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
          clientId: selectedClient?.id ?? null,
          items: items.map(({ productId, quantity, price }) => ({
            productId,
            quantity,
            price,
          })),
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
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex-1 flex flex-col min-h-0">
      {/* Page title + back */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2 shrink-0">
          <Link href="/ventas">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Ventas
          </Link>
        </Button>
        <div className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-1.5 rounded-xl shadow-md shadow-indigo-500/25">
          <ShoppingCart className="h-3.5 w-3.5 text-white" />
          <h1 className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
            Nueva venta
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
                className={cn(
                  "flex items-center gap-2.5 group",
                  done && "cursor-pointer"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200",
                    done
                      ? "bg-linear-to-r from-indigo-600 to-violet-600 text-white"
                      : active
                      ? "bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
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
                    step > s.id ? "bg-indigo-400" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content with animation */}
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
          {/* ── STEP 1: Cliente ── */}
          {step === 1 && (
            <div className="rounded-2xl border bg-card overflow-hidden h-full flex flex-col">
              <div className="h-1 bg-linear-to-r from-indigo-500 to-violet-600 shrink-0" />
              <div className="px-5 py-3 border-b flex items-center gap-2 shrink-0">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                  <User className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <p className="font-semibold text-sm">Seleccionar cliente</p>
                {selectedClient && (
                  <span className="ml-auto text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full font-medium">
                    {selectedClient.firstName} {selectedClient.lastName ?? ""}
                  </span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-h-0 p-5 gap-3">
                <Input
                  placeholder="Buscar por nombre..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  autoFocus
                />
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
                  {filteredClients.slice(0, 10).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClient(c)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150",
                        selectedClient?.id === c.id
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                          : "border-transparent hover:bg-muted/60 hover:border-border"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {c.firstName} {c.lastName ?? ""}
                        </span>
                        {selectedClient?.id === c.id && (
                          <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                    </button>
                  ))}
                  {filteredClients.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Sin resultados
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    onClick={() => {
                      setSelectedClient(null)
                      goTo(2)
                    }}
                  >
                    <UserX className="h-4 w-4" />
                    Sin cliente
                  </Button>
                  <Button
                    onClick={() => goTo(2)}
                    disabled={!selectedClient}
                    className="gap-2"
                  >
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Productos ── */}
          {step === 2 && (
            <div className="rounded-2xl border bg-card overflow-hidden h-full flex flex-col">
              <div className="h-1 bg-linear-to-r from-indigo-500 to-violet-600 shrink-0" />
              <div className="px-5 py-3 border-b flex items-center gap-2 shrink-0">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-500/10">
                  <Package className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <p className="font-semibold text-sm">Agregar productos</p>
                {items.length > 0 && (
                  <span className="ml-auto text-xs bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full font-medium">
                    {items.length} producto{items.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-h-0 p-5 gap-4">
                {/* Product search */}
                <div className="relative">
                  <Input
                    placeholder="Buscar producto por nombre o código..."
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
                              ${Number(p.sellPrice).toLocaleString("es-AR")} · Stock: {p.stock}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          Sin resultados
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm border border-dashed rounded-xl">
                      Buscá y agregá productos al carrito
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-muted/30"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ${item.price.toLocaleString("es-AR")} c/u
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQty(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-mono font-bold tabular-nums">
                              {item.quantity}
                            </span>
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
                          <span className="text-sm font-semibold w-24 text-right tabular-nums shrink-0">
                            ${(item.price * item.quantity).toLocaleString("es-AR")}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-between items-center px-2 pt-1 text-sm font-bold">
                        <span className="text-muted-foreground font-normal">Subtotal</span>
                        <span className="tabular-nums">${subtotal.toLocaleString("es-AR")}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goTo(1)}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </Button>
                  <Button
                    onClick={() => goTo(3)}
                    disabled={items.length === 0}
                    className="gap-2"
                  >
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Resumen ── */}
          {step === 3 && (
            <div className="rounded-2xl border bg-card overflow-hidden h-full flex flex-col">
              <div className="h-1 bg-linear-to-r from-indigo-500 to-violet-600 shrink-0" />
              <div className="px-5 py-3 border-b flex items-center gap-2 shrink-0">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <p className="font-semibold text-sm">Confirmar venta</p>
              </div>
              <div className="flex flex-col flex-1 min-h-0 p-5 gap-4">
                <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
                  {/* Client summary */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 shrink-0">
                      <User className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="text-sm font-semibold">
                        {selectedClient
                          ? `${selectedClient.firstName} ${selectedClient.lastName ?? ""}`
                          : "Sin cliente"}
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
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between text-sm px-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium truncate">{item.name}</span>
                          <span className="text-muted-foreground shrink-0">×{item.quantity}</span>
                        </div>
                        <span className="tabular-nums font-medium shrink-0 ml-4">
                          ${(item.price * item.quantity).toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Discount */}
                  <div className="flex items-center gap-3">
                    <Label className="text-sm shrink-0 text-muted-foreground">Descuento ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={discount || ""}
                      placeholder="0"
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-36 h-8"
                    />
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-destructive px-1">
                      <span>Descuento</span>
                      <span className="tabular-nums">- ${discount.toLocaleString("es-AR")}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-2xl px-1 pt-1">
                    <span>Total</span>
                    <span className="tabular-nums">${total.toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goTo(2)}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="gap-2 bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:opacity-90 transition-opacity"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Confirmar venta
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
