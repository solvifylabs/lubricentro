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
import { Plus, Car, UserX, Wrench } from "lucide-react"
import type { Vehiculo, Cliente } from "@/types"

const PAGE_SIZE = 10

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; clientId?: string; page?: string }>
}) {
  const { search = "", clientId = "", page = "1" } = await searchParams
  const pageNum = Math.max(1, parseInt(page))
  const skip = (pageNum - 1) * PAGE_SIZE

  const where = {
    ...(search && {
      OR: [
        { plate: { contains: search, mode: "insensitive" as const } },
        { brand: { contains: search, mode: "insensitive" as const } },
        { model: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(clientId && { clientId }),
  }

  const [vehicles, total, noClientCount] = await Promise.all([
    prisma.vehiculo.findMany({
      where,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { services: true } },
      },
      orderBy: { plate: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.vehiculo.count({ where }),
    prisma.vehiculo.count({ where: { clientId: null } }),
  ])

  const paginationParams: Record<string, string> = {}
  if (search) paginationParams.search = search
  if (clientId) paginationParams.clientId = clientId

  return (
    <div>
      <PageHeader
        title="Vehículos"
        description={`${total} vehículo${total !== 1 ? "s" : ""} registrados`}
        helpTour="vehiculos"
        action={
          <Button asChild id="vehiculos-new-btn">
            <Link href="/vehiculos/nuevo">
              <Plus className="h-4 w-4 mr-1" /> Nuevo vehículo
            </Link>
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Car className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total vehículos</p>
            <p className="text-lg font-bold tabular-nums">{total}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 shrink-0">
            <UserX className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sin cliente</p>
            <p className="text-lg font-bold tabular-nums text-rose-600">{noClientCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-3 mb-4" id="vehiculos-search">
        <form>
          <Input
            name="search"
            placeholder="Buscar por dominio, marca, modelo..."
            defaultValue={search}
            className="max-w-sm bg-background"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" id="vehiculos-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dominio</TableHead>
              <TableHead>Marca / Modelo</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Motor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-center">Servicios</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No se encontraron vehículos.
                </TableCell>
              </TableRow>
            )}
            {vehicles.map((v: Vehiculo & { client: Pick<Cliente, "id" | "firstName" | "lastName"> | null; _count: { services: number } }) => (
              <TableRow key={v.id}>
                <TableCell>
                  <span className="font-mono font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 px-2 py-0.5 rounded-md text-sm">
                    {v.plate}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{v.brand} {v.model}</TableCell>
                <TableCell className="text-muted-foreground">{v.year ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{v.engine ?? "—"}</TableCell>
                <TableCell>
                  {v.client ? (
                    <Link href={`/clientes/${v.client.id}`} className="hover:underline text-sm font-medium">
                      {v.client.firstName} {v.client.lastName ?? ""}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-medium">
                    <Wrench className="h-3 w-3 text-muted-foreground" />
                    {v._count.services}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/vehiculos/${v.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationNav total={total} page={pageNum} pageSize={PAGE_SIZE} basePath="/vehiculos" params={paginationParams} />
      </div>
    </div>
  )
}
