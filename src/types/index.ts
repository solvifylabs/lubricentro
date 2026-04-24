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
  TurnoLavaAuto,
  SesionLavaAuto,
  SesionProducto,
}

export type ProductoWithRelations = Producto & {
  category: Categoria
  brand: Marca | null
}

export type ClienteWithRelations = Cliente & {
  vehicles: Vehiculo[]
  services: Servicio[]
  sales: Venta[]
}

export type VehiculoWithRelations = Vehiculo & {
  client: Cliente | null
  services: Servicio[]
}

export type ServicioWithRelations = Servicio & {
  client: Cliente | null
  vehicle: Vehiculo
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
}

export type CartItem = {
  productId: string
  name: string
  quantity: number
  price: number
}
