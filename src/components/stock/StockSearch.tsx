"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useCallback } from "react"
import type { Categoria } from "@/types"

interface StockSearchProps {
  categories: Categoria[]
}

export function StockSearch({ categories }: StockSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/stock?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex gap-3 flex-wrap">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o código..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        defaultValue={searchParams.get("categoryId") ?? "all"}
        onValueChange={(v: string | null) => update("categoryId", v ?? "all")}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
