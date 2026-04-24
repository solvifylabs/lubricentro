import type {
  Categoria,
  Marca,
  Producto,
  MovimientoStock,
  Cliente,
  Vehiculo,
  Servicio,
  ServicioProducto,
  Venta,
  DetalleVenta,
  Proveedor,
  ProveedorProducto,
  Compra,
  ConfigLavaAuto,
  ConfigServicio,
  TurnoLavaAuto,
  SesionLavaAuto,
  SesionProducto,
} from "@prisma/client"

export type {
  Categoria,
  Marca,
  Producto,
  MovimientoStock,
  Cliente,
  Vehiculo,
  Servicio,
  ServicioProducto,
  Venta,
  DetalleVenta,
  Proveedor,
  ProveedorProducto,
  Compra,
  ConfigLavaAuto,
  ConfigServicio,
  TurnoLavaAuto,
  SesionLavaAuto,
  SesionProducto,
}

export type WashPrices = {
  priceInterior: number
  priceExterior: number
  priceIntegro: number
}

export type ProductoWithRelations = Producto & {
  category: Categoria
  brand: Marca | null
}

export type ClienteWithRelations = Cliente & {
  vehicles: Vehiculo[]
  sales: Venta[]
}

export type VehiculoWithRelations = Vehiculo & {
  client: Cliente
  services: Servicio[]
}

export type ServicioWithRelations = Servicio & {
  vehicle: (Vehiculo & { client: Cliente }) | null
  products: (ServicioProducto & { product: Producto })[]
}

export type VentaWithRelations = Venta & {
  client: Cliente | null
  items: (DetalleVenta & { product: Producto })[]
}

export type ProveedorWithRelations = Proveedor & {
  productLinks: (ProveedorProducto & { product: Producto })[]
  purchases: Compra[]
}

export type SesionLavaAutoWithRelations = SesionLavaAuto & {
  turno: TurnoLavaAuto | null
  products: (SesionProducto & { product: Producto })[]
}

export type SesionItem = {
  productId: string
  name: string
  quantity: number
  buyPrice: number
}

export type CartItem = {
  productId: string
  name: string
  quantity: number
  price: number
}
