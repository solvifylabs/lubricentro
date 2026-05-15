import { Sidebar } from "@/components/layout/Sidebar"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { Toaster } from "@/components/ui/sonner"
import { TourProvider } from "@/components/layout/TourProvider"
import { DemoProvider } from "@/providers/DemoProvider"
import { getRole } from "@/lib/auth/roles"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const role = getRole(null)

  return (
    <TourProvider>
      <DemoProvider>
        <div className="flex h-screen">
          {/* Desktop sidebar */}
          <div className="hidden md:flex">
            <Sidebar role={role} />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile header */}
            <header className="md:hidden flex items-center gap-3 p-4 border-b">
              <MobileSidebar role={role} />
              <h1 className="font-bold text-lg">Lavalle</h1>
            </header>

            <main className="flex-1 p-6 overflow-auto flex flex-col">
              {children}
            </main>
          </div>

          <Toaster richColors position="top-right" />
        </div>
      </DemoProvider>
    </TourProvider>
  )
}
