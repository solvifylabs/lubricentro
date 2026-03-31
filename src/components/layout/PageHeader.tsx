import { ReactNode } from "react"
import { HelpButton } from "@/components/layout/HelpButton"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  helpTour?: string
}

export function PageHeader({ title, description, action, helpTour }: PageHeaderProps) {
  return (
    <div className="rounded-2xl border bg-card px-5 py-4 mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {/* Title pill — mirrors the sidebar active item */}
        <div className="inline-flex items-center gap-2 bg-yellow-400 px-4 py-1.5 rounded-xl shadow-md shadow-yellow-400/25 shrink-0">
          <h1 className="text-sm font-bold tracking-tight text-gray-950 whitespace-nowrap">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-muted-foreground text-sm truncate">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {helpTour && <HelpButton tourName={helpTour} />}
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
