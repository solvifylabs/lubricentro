"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"
import type { Categoria } from "@/types"

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Categoria[]>([])
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch("/api/stock/categorias")
    setCategories(await res.json())
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/stock/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) throw new Error()
      toast.success("Categoría creada")
      setName("")
      load()
    } catch {
      toast.error("Error al crear la categoría")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Categorías de productos" />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="Nueva categoría..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Agregar
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell className="text-center text-muted-foreground py-6">
                  No hay categorías aún.
                </TableCell>
              </TableRow>
            )}
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
