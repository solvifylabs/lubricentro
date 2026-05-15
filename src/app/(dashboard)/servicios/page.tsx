"use client"

import { Suspense } from "react"
import { useDemoStore } from "@/lib/demo/store"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PaginationNav } from "@/components/ui/pagination-nav"
import { Plus, Wrench, CalendarClock, DollarSign } from "lucide-react"
import { WhatsAppButton } from "@/components/clientes/WhatsAppButton"

const PAGE_SIZE = 10

function ServiciosPageInner() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search") ?? ""
  const date = searchParams.get("date") ?? ""
  const pageNum = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const skip = (pageNum - 1) * PAGE_SIZE

  const store = useDemoStore()
  const today = new Date().toISOString().split("T")[0]

  const withJoins = store.servicios.map((s) => {
    const vehicle = s.vehicleId ? store.vehiculos.find((v) => v.id === s.vehicleId) ?? null : null
    const client = vehicle?.clientId ? store.clientes.find((c) => c.id === vehicle.clientId) ?? null : null
    return { ...s, vehicle: vehicle ? { ...vehicle, client } : null }
  })

  const filtered = withJoins.filter((s) => {
    if (date) {
      const sDate = new Date(s.serviceDate).toISOString().split("T")[0]
      if (sDate !== date) return false
    }
    if (search) {
      const q = search.toLowerCase()
      const plate = s.vehicle?.plate.toLowerCase() ?? ""
      const first = s.vehicle?.client?.firstName.toLowerCase() ?? ""
      const last = s.vehicle?.client?.lastName?.toLowerCase() ?? ""
      if (!plate.includes(q) && !first.includes(q) && !last.includes(q)) return false
    }
    return true
  }).sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())

  const total = filtered.length
  const totalCount = store.servicios.length

  const todayServices = store.servicios.filter(
    (s) => new Date(s.serviceDate).toISOString().split("T")[0] === today
  )
  const todayCount = todayServices.length
  const todayTotal = todayServices.reduce((acc, s) => acc + Number(s.amount), 0)

  const services = filtered.slice(skip, skip + PAGE_SIZE)

  const paginationParams: Record<string, string> = {}
  if (search) paginationParams.search = search
  if (date) paginationParams.date = date

  return (
    <div>
      <PageHeader
        title="Servicios"
        description={`${totalCount} servicio${totalCount !== 1 ? "s" : ""} registrados`}
        helpTour="servicios"
        action={
          <Button asChild id="servicios-new-btn">
            <Link href="/servicios/nuevo">
              <Plus className="h-4 w-4 mr-1" /> Nuevo servicio
            </Link>
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Wrench className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total servicios</p>
            <p className="text-lg font-bold tabular-nums">{totalCount}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <CalendarClock className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hoy</p>
            <p className="text-lg font-bold tabular-nums">{todayCount}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Facturado hoy</p>
            <p className="text-lg font-bold tabular-nums text-yellow-600">${todayTotal.toLocaleString("es-AR")}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-3 mb-4" id="servicios-search">
        <form className="flex gap-3 flex-wrap">
          <Input
            name="search"
            placeholder="Buscar por dominio o cliente..."
            defaultValue={search}
            className="max-w-sm bg-background"
            id="servicios-search-input"
          />
          <Input
            name="date"
            type="date"
            defaultValue={date || today}
            className="w-44 bg-background"
            id="servicios-date"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" id="servicios-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Km</TableHead>
              <TableHead>Próximo service</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No se encontraron servicios.
                </TableCell>
              </TableRow>
            )}
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm">
                  {new Date(s.serviceDate).toLocaleDateString("es-AR")}
                </TableCell>
                <TableCell>
                  {s.vehicle ? (
                    <>
                      <Link href={`/vehiculos/${s.vehicle.id}`} className="font-mono font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 px-2 py-0.5 rounded-md text-sm hover:underline">
                        {s.vehicle.plate}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.vehicle.brand} {s.vehicle.model}</p>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Sin vehículo</span>
                  )}
                </TableCell>
                <TableCell>
                  {s.vehicle?.client ? (
                    <div className="flex flex-col gap-1">
                      <Link href={`/clientes/${s.vehicle.client.id}`} className="hover:underline text-sm">
                        {s.vehicle.client.firstName} {s.vehicle.client.lastName ?? ""}
                      </Link>
                      {s.vehicle.client.phone && (
                        <WhatsAppButton
                          phone={s.vehicle.client.phone}
                          label="Recordatorio"
                          message={`Hola ${s.vehicle.client.firstName}! Te recordamos que tu próximo service es el ${s.nextServiceDate ? new Date(s.nextServiceDate).toLocaleDateString("es-AR") : "próximamente"}. ¡Cualquier consulta estamos a disposición!`}
                        />
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin cliente</span>
                  )}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {s.mileage ? `${s.mileage.toLocaleString("es-AR")} km` : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {s.nextServiceDate
                    ? new Date(s.nextServiceDate).toLocaleDateString("es-AR")
                    : "—"}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ${Number(s.amount).toLocaleString("es-AR")}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/servicios/${s.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationNav
          total={total}
          page={pageNum}
          pageSize={PAGE_SIZE}
          basePath="/servicios"
          params={paginationParams}
        />
      </div>
    </div>
  )
}

export default function ServiciosPage() {
  return (
    <Suspense>
      <ServiciosPageInner />
    </Suspense>
  )
}
