export const dynamic = 'force-dynamic'

import Link from "next/link"
import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PaginationNav } from "@/components/ui/pagination-nav"
import { Plus, Users, Car, Wrench, Phone } from "lucide-react"
import type { Cliente } from "@/types"

const PAGE_SIZE = 10

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { search = "", page = "1" } = await searchParams
  const pageNum = Math.max(1, parseInt(page))
  const skip = (pageNum - 1) * PAGE_SIZE

  const where = {
    active: true,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search } },
      ],
    }),
  }

  const [clients, total, totalVehicles, totalServices] = await Promise.all([
    prisma.cliente.findMany({
      where,
      include: {
        vehicles: { select: { plate: true } },
      },
      orderBy: { firstName: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.cliente.count({ where }),
    prisma.vehiculo.count(),
    prisma.servicio.count(),
  ])

  const paginationParams: Record<string, string> = {}
  if (search) paginationParams.search = search

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${total} cliente${total !== 1 ? "s" : ""} registrados`}
        helpTour="clientes"
        action={
          <Button asChild id="clientes-new-btn">
            <Link href="/clientes/nuevo">
              <Plus className="h-4 w-4 mr-1" /> Nuevo cliente
            </Link>
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Users className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Clientes</p>
            <p className="text-lg font-bold tabular-nums">{total}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Car className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vehículos</p>
            <p className="text-lg font-bold tabular-nums">{totalVehicles}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <Wrench className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Servicios</p>
            <p className="text-lg font-bold tabular-nums">{totalServices}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-3 mb-4" id="clientes-search">
        <form>
          <Input
            name="search"
            placeholder="Buscar por nombre, teléfono..."
            defaultValue={search}
            className="max-w-sm bg-background"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" id="clientes-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead className="text-center">Vehículos</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            )}
            {clients.map((c: Cliente & { vehicles: { plate: string }[] }) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  {c.firstName} {c.lastName ?? ""}
                </TableCell>
                <TableCell>
                  {c.phone ? (
                    <a
                      href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-yellow-700 hover:text-yellow-800 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {c.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{c.dni ?? "—"}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-medium">
                    <Car className="h-3 w-3 text-muted-foreground" />
                    {c.vehicles.length}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/clientes/${c.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationNav total={total} page={pageNum} pageSize={PAGE_SIZE} basePath="/clientes" params={paginationParams} />
      </div>
    </div>
  )
}
