export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { DetailHeader } from "@/components/layout/DetailHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClienteForm } from "@/components/clientes/ClienteForm"
import { WhatsAppButton } from "@/components/clientes/WhatsAppButton"
import { User, Car, Plus, Wrench, ShoppingCart, Phone, Mail } from "lucide-react"
import type { Vehiculo, Servicio, Venta } from "@/types"

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const client = await prisma.cliente.findUnique({
    where: { id },
    include: {
      vehicles: true,
      services: {
        include: { vehicle: true },
        orderBy: { serviceDate: "desc" },
        take: 10,
      },
      sales: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!client) notFound()

  const totalServiceAmount = client.services.reduce((acc, s) => acc + Number(s.amount), 0)
  const totalSaleAmount = client.sales
    .filter(s => s.status === "completed")
    .reduce((acc, s) => acc + Number(s.total), 0)

  return (
    <div className="max-w-3xl mx-auto">
      <DetailHeader
        title={`${client.firstName} ${client.lastName ?? ""}`}
        description={client.email ?? (client.phone ? client.phone : undefined)}
        backHref="/clientes"
        backLabel="Clientes"
        icon={User}
        gradient="from-yellow-400 to-yellow-500"
        actions={
          <div className="flex gap-2">
            {client.phone && <WhatsAppButton phone={client.phone} />}
            <Button variant="outline" asChild>
              <Link href={`/vehiculos?clientId=${client.id}`}>
                <Car className="mr-2 h-4 w-4" /> Vehículos
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <Car className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vehículos</p>
            <p className="text-lg font-bold tabular-nums">{client.vehicles.length}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <Wrench className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Servicios</p>
            <p className="text-lg font-bold tabular-nums">{client.services.length}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 shrink-0">
            <ShoppingCart className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Compras</p>
            <p className="text-lg font-bold tabular-nums">{client.sales.length}</p>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="rounded-xl border bg-card px-5 py-4 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        {client.phone && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Teléfono</p>
            <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 font-medium text-yellow-700 hover:underline">
              <Phone className="h-3.5 w-3.5" /> {client.phone}
            </a>
          </div>
        )}
        {client.dni && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">DNI</p>
            <p className="font-mono font-medium">{client.dni}</p>
          </div>
        )}
        {client.email && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Email</p>
            <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 font-medium hover:underline truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" /> {client.email}
            </a>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Total en servicios</p>
          <p className="font-semibold tabular-nums text-yellow-600">${totalServiceAmount.toLocaleString("es-AR")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Total en compras</p>
          <p className="font-semibold tabular-nums text-yellow-600">${totalSaleAmount.toLocaleString("es-AR")}</p>
        </div>
      </div>

      <Tabs defaultValue="vehiculos">
        <TabsList>
          <TabsTrigger value="vehiculos">Vehículos ({client.vehicles.length})</TabsTrigger>
          <TabsTrigger value="servicios">Servicios ({client.services.length})</TabsTrigger>
          <TabsTrigger value="ventas">Compras ({client.sales.length})</TabsTrigger>
          <TabsTrigger value="editar">Editar</TabsTrigger>
        </TabsList>

        <TabsContent value="vehiculos" className="mt-4 space-y-2">
          <div className="mb-3">
            <Button size="sm" asChild>
              <Link href={`/vehiculos/nuevo?clientId=${client.id}`}>
                <Plus className="h-4 w-4 mr-1" /> Agregar vehículo
              </Link>
            </Button>
          </div>
          {client.vehicles.length === 0 ? (
            <div className="rounded-xl border bg-card px-5 py-10 text-center text-muted-foreground text-sm">
              Sin vehículos registrados.
            </div>
          ) : (
            client.vehicles.map((v: Vehiculo) => (
              <div key={v.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors">
                <div>
                  <span className="font-mono font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 px-2 py-0.5 rounded-md text-sm">
                    {v.plate}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {v.brand} {v.model} {v.year ? `(${v.year})` : ""}
                    {v.engine ? ` · ${v.engine}` : ""}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/vehiculos/${v.id}`}>Ver</Link>
                </Button>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="servicios" className="mt-4 space-y-2">
          {client.services.length === 0 ? (
            <div className="rounded-xl border bg-card px-5 py-10 text-center text-muted-foreground text-sm">
              Sin servicios registrados.
            </div>
          ) : (
            client.services.map((s: Servicio & { vehicle: Vehiculo }) => (
              <div key={s.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 px-2 py-0.5 rounded-md text-xs">
                      {s.vehicle.plate}
                    </span>
                    <span className="text-sm text-muted-foreground">{s.vehicle.brand} {s.vehicle.model}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(s.serviceDate).toLocaleDateString("es-AR")}
                    {s.mileage ? ` · ${s.mileage.toLocaleString("es-AR")} km` : ""}
                  </p>
                  {s.nextServiceDate && (
                    <p className="text-xs text-muted-foreground">
                      Próximo service: {new Date(s.nextServiceDate).toLocaleDateString("es-AR")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold tabular-nums">${Number(s.amount).toLocaleString("es-AR")}</p>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/servicios/${s.id}`}>Ver</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="ventas" className="mt-4 space-y-2">
          {client.sales.length === 0 ? (
            <div className="rounded-xl border bg-card px-5 py-10 text-center text-muted-foreground text-sm">
              Sin compras registradas.
            </div>
          ) : (
            client.sales.map((v: Venta) => (
              <div key={v.id} className="rounded-xl border bg-card px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors">
                <p className="text-sm text-muted-foreground">
                  {new Date(v.createdAt).toLocaleDateString("es-AR")}
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant={v.status === "completed" ? "secondary" : "destructive"}>
                    {v.status === "completed" ? "Completada" : "Anulada"}
                  </Badge>
                  <p className="font-semibold tabular-nums">${Number(v.total).toLocaleString("es-AR")}</p>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="editar" className="mt-4">
          <ClienteForm client={client} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
