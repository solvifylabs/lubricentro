import { ReactNode } from "react"
import Link from "next/link"
import { ChevronLeft, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DetailHeaderProps {
  title: string
  description?: string
  backHref: string
  backLabel: string
  icon: LucideIcon
  /** Tailwind gradient classes for the icon bg, e.g. "from-yellow-400 to-yellow-500" */
  gradient?: string
  /** Use dark icon text — set true when gradient is light (e.g. yellow) */
  iconTextDark?: boolean
  actions?: ReactNode
}

export function DetailHeader({
  title,
  description,
  backHref,
  backLabel,
  icon: Icon,
  gradient = "from-yellow-400 to-yellow-500",
  iconTextDark = true,
  actions,
}: DetailHeaderProps) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden mb-6">
      {/* Gradient accent strip */}
      <div className={`h-1 bg-linear-to-r ${gradient}`} />

      <div className="px-6 py-5">
        {/* Back link */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
        >
          <Link href={backHref}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {backLabel}
          </Link>
        </Button>

        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Gradient icon */}
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-2xl bg-linear-to-br ${gradient} shadow-lg shadow-black/15 shrink-0`}
            >
              <Icon className={`h-5 w-5 ${iconTextDark ? "text-gray-950" : "text-white"}`} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight leading-tight">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="shrink-0 flex items-center gap-2">{actions}</div>
          )}
        </div>
      </div>
    </div>
  )
}
