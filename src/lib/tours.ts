import type { Tour } from "nextstepjs"

export const tours: Tour[] = [
  // ─── Stock ───────────────────────────────────────────────────────────────
  {
    tour: "stock",
    steps: [
      {
        icon: "📦",
        title: "Gestión de Stock",
        content: "Acá manejás todos los productos del lubricentro: aceites, filtros, aditivos y más.",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "🔍",
        title: "Buscar productos",
        content: "Escribí el nombre o código del producto para encontrarlo rápido.",
        selector: "#stock-search",
        side: "bottom",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "🏷️",
        title: "Filtrar por categoría",
        content: "Filtrá por categoría (Aceites, Filtros, Aditivos…) para ver solo lo que necesitás.",
        selector: "#stock-category-filter",
        side: "bottom",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "➕",
        title: "Nuevo producto",
        content: "Creá un nuevo producto completando nombre, precio, stock mínimo y más.",
        selector: "#stock-new-btn",
        side: "left",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "📊",
        title: "Tabla de productos",
        content: "Cada fila muestra el producto, su código, precio de venta y stock actual. Si el stock es bajo aparece en rojo.",
        selector: "#stock-table",
        side: "top",
        pointerPadding: 8,
        pointerRadius: 12,
      },
      {
        icon: "🗂️",
        title: "Categorías",
        content: "Desde el botón Categorías podés crear y administrar categorías para organizar mejor tus productos.",
        selector: "#stock-cat-btn",
        side: "left",
        pointerPadding: 8,
        pointerRadius: 10,
      },
    ],
  },

  // ─── Clientes ─────────────────────────────────────────────────────────────
  {
    tour: "clientes",
    steps: [
      {
        icon: "👥",
        title: "Gestión de Clientes",
        content: "Acá tenés el registro de todos tus clientes con sus datos de contacto y vehículos asociados.",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "🔍",
        title: "Buscar clientes",
        content: "Buscá por nombre, apellido o teléfono para encontrar un cliente rápidamente.",
        selector: "#clientes-search",
        side: "bottom",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "➕",
        title: "Nuevo cliente",
        content: "Registrá un nuevo cliente con nombre, teléfono, email y DNI.",
        selector: "#clientes-new-btn",
        side: "left",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "📋",
        title: "Tabla de clientes",
        content: "Ves nombre, teléfono con acceso directo a WhatsApp, DNI, cantidad de vehículos y servicios realizados.",
        selector: "#clientes-table",
        side: "top",
        pointerPadding: 8,
        pointerRadius: 12,
      },
    ],
  },

  // ─── Vehículos ────────────────────────────────────────────────────────────
  {
    tour: "vehiculos",
    steps: [
      {
        icon: "🚗",
        title: "Gestión de Vehículos",
        content: "Registrá y gestioná todos los vehículos de tus clientes: patente, marca, modelo, año y motor.",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "🔍",
        title: "Buscar vehículos",
        content: "Buscá por patente, marca o modelo para encontrar el vehículo que necesitás.",
        selector: "#vehiculos-search",
        side: "bottom",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "➕",
        title: "Nuevo vehículo",
        content: "Registrá un nuevo vehículo y asignalo a un cliente existente.",
        selector: "#vehiculos-new-btn",
        side: "left",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "📋",
        title: "Tabla de vehículos",
        content: "Ves la patente, marca/modelo, año, motor, cliente dueño y la cantidad de servicios realizados.",
        selector: "#vehiculos-table",
        side: "top",
        pointerPadding: 8,
        pointerRadius: 12,
      },
    ],
  },

  // ─── Servicios ────────────────────────────────────────────────────────────
  {
    tour: "servicios",
    steps: [
      {
        icon: "🔧",
        title: "Gestión de Servicios",
        content: "Acá registrás todos los servicios realizados: cambios de aceite, filtros y más. Podés ver el historial por cliente o vehículo.",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "🔍",
        title: "Buscar servicios",
        content: "Buscá por patente o nombre del cliente para filtrar los servicios.",
        selector: "#servicios-search",
        side: "bottom",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "📅",
        title: "Filtrar por fecha",
        content: "Elegí una fecha específica para ver los servicios de ese día. Por defecto muestra hoy.",
        selector: "#servicios-date",
        side: "bottom",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "➕",
        title: "Nuevo servicio",
        content: "Registrá un nuevo servicio indicando el vehículo, kilómetros, productos usados y el próximo service.",
        selector: "#servicios-new-btn",
        side: "left",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "📋",
        title: "Tabla de servicios",
        content: "Ves fecha, vehículo, cliente (con acceso directo a WhatsApp para recordatorios), kilómetros y monto cobrado.",
        selector: "#servicios-table",
        side: "top",
        pointerPadding: 8,
        pointerRadius: 12,
      },
    ],
  },

  // ─── Ventas ───────────────────────────────────────────────────────────────
  {
    tour: "ventas",
    steps: [
      {
        icon: "🛒",
        title: "Gestión de Ventas",
        content: "Acá registrás las ventas directas de productos sin servicio de mano de obra. Podés ver el total del día.",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "📅",
        title: "Filtrar por fecha",
        content: "Cambiá la fecha para ver las ventas de cualquier día. Por defecto muestra las de hoy.",
        selector: "#ventas-date",
        side: "bottom",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "➕",
        title: "Nueva venta",
        content: "Creá una nueva venta seleccionando productos, cantidades, aplicando descuentos y asignando un cliente.",
        selector: "#ventas-new-btn",
        side: "left",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "📋",
        title: "Tabla de ventas",
        content: "Ves hora, cliente, productos vendidos, estado (completada/anulada) y el total. Las ventas anuladas aparecen atenuadas.",
        selector: "#ventas-table",
        side: "top",
        pointerPadding: 8,
        pointerRadius: 12,
      },
    ],
  },

  // ─── Proveedores ──────────────────────────────────────────────────────────
  {
    tour: "proveedores",
    steps: [
      {
        icon: "🚚",
        title: "Gestión de Proveedores",
        content: "Acá administrás tus proveedores: datos de contacto, los productos que suministran y el historial de compras.",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "➕",
        title: "Nuevo proveedor",
        content: "Registrá un nuevo proveedor con nombre, contacto y teléfono. Luego podés vincularle productos.",
        selector: "#proveedores-new-btn",
        side: "left",
        pointerPadding: 8,
        pointerRadius: 10,
      },
      {
        icon: "📋",
        title: "Tabla de proveedores",
        content: "Ves nombre, contacto, teléfono, cuántos productos suministran y cuántas compras se les realizaron.",
        selector: "#proveedores-table",
        side: "top",
        pointerPadding: 8,
        pointerRadius: 12,
      },
    ],
  },
]
