import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationNavProps {
  total: number
  page: number
  pageSize: number
  basePath: string
  params?: Record<string, string>
}

export function PaginationNav({
  total,
  page,
  pageSize,
  basePath,
  params = {},
}: PaginationNavProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1 && total <= pageSize) return null

  const from = Math.min((page - 1) * pageSize + 1, total)
  const to = Math.min(page * pageSize, total)

  function href(p: number) {
    const sp = new URLSearchParams({ ...params, page: String(p) })
    return `${basePath}?${sp}`
  }

  const pages: (number | "...")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("...")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push("...")
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
      <p className="text-sm text-muted-foreground">
        Mostrando {from}–{to} de {total} resultado{total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1">
        {page <= 1 ? (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={href(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className="w-8"
              asChild
            >
              <Link href={href(p as number)}>{p}</Link>
            </Button>
          )
        )}

        {page >= totalPages ? (
          <Button variant="outline" size="sm" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={href(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
