"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"
import type { Role } from "@/lib/auth/roles"

export function MobileSidebar({ role }: { role: Role | null }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          "inline-flex items-center justify-center rounded-lg h-8 w-8 text-sm",
          "hover:bg-muted transition-colors md:hidden"
        )}
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar role={role} />
      </SheetContent>
    </Sheet>
  )
}
