# Lubricentro — Project Specifications
**Client**: Lubricentro, Cipolletti, Río Negro
**Last updated**: 2026-03-31

---

## 1. Overview

Sistema web de gestión operativa para lubricentro. Reemplaza un CMS legacy de escritorio. Accesible desde computadora, celular y tablet (responsive, cloud).

**Stack**: Next.js 16.2.1 · React 19 · TypeScript · Tailwind v4 · Prisma ORM · PostgreSQL · Supabase Auth · shadcn/ui

---

## 2. Autenticación

### REQ-AUTH-1: Login con email y contraseña
El sistema MUST autenticar usuarios con email y contraseña vía Supabase Auth.

**Scenario: Login exitoso**
- GIVEN un usuario con credenciales válidas
- WHEN envía email y contraseña
- THEN es redirigido al dashboard

**Scenario: Credenciales inválidas**
- GIVEN un usuario con credenciales incorrectas
- WHEN envía el formulario
- THEN recibe mensaje de error y permanece en login

### REQ-AUTH-2: Rutas protegidas
El sistema MUST redirigir a `/login` si el usuario no está autenticado e intenta acceder a cualquier ruta del dashboard.

---

## 3. Módulo Stock

### REQ-STOCK-1: Gestión de productos
El sistema MUST permitir crear, editar y desactivar productos.

Campos requeridos: `nombre`, `categoría`, `precio de compra`, `precio de venta`.
Campos opcionales: `código`, `marca`, `unidad`, `stock inicial`, `stock mínimo`.

**Scenario: Crear producto con stock inicial**
- GIVEN el formulario de nuevo producto completo
- WHEN se guarda con `stock > 0`
- THEN se crea el producto Y se registra un MovimientoStock de tipo `entry` con razón "Stock inicial"

**Scenario: Código duplicado**
- GIVEN un código que ya existe en otro producto activo
- WHEN se intenta guardar
- THEN el sistema MUST rechazar la operación con error de unicidad

### REQ-STOCK-2: Movimientos de stock
El sistema MUST registrar cada entrada, salida o ajuste de stock como un MovimientoStock con tipo (`entry` | `exit` | `adjustment`) y razón.

Las salidas por venta y por servicio MUST generarse automáticamente (sin acción manual del operador).

**Scenario: Ajuste manual**
- GIVEN un producto existente
- WHEN el operador registra un ajuste de cantidad
- THEN el stock del producto se actualiza Y se registra movimiento tipo `adjustment`

### REQ-STOCK-3: Alertas de stock bajo
El sistema SHOULD mostrar visualmente los productos cuyo `stock <= minStock`.

**Scenario: Filtro de stock bajo**
- GIVEN productos con stock por debajo del mínimo
- WHEN el operador activa el filtro `lowStock`
- THEN solo se muestran esos productos

### REQ-STOCK-4: Categorías y marcas
El sistema MUST permitir gestionar categorías y marcas como entidades independientes con nombre único.

### REQ-STOCK-5: Búsqueda de productos
El sistema MUST permitir buscar productos por nombre o código (case-insensitive). MUST permitir filtrar por categoría.

---

## 4. Módulo Servicios

### REQ-SVC-1: Registro de servicio
El sistema MUST permitir registrar un servicio asociado a un vehículo.

Campos requeridos: `vehículo`, `fecha de servicio`, `monto`.
Campos opcionales: `cliente`, `kilometraje`, `próximo service km`, `próxima fecha de service`, `notas`, `productos utilizados`.

**Scenario: Servicio con productos**
- GIVEN un servicio nuevo con productos cargados
- WHEN se confirma
- THEN se crea el Servicio, se crean los ServicioProducto, se decrementa el stock de cada producto y se registran movimientos tipo `exit`

**Scenario: Servicio sin cliente**
- GIVEN un vehículo sin cliente asignado
- WHEN se registra un servicio
- THEN el sistema MUST permitirlo (clientId es opcional)

### REQ-SVC-2: Historial de servicios
El sistema MUST listar servicios ordenados por fecha descendente. MUST permitir buscar por patente de vehículo o nombre de cliente. MUST permitir filtrar por fecha.

### REQ-SVC-3: Detalle de servicio
El sistema MUST mostrar todos los datos del servicio incluyendo productos utilizados, datos del vehículo y datos del cliente.

---

## 5. Módulo Clientes

### REQ-CLI-1: Gestión de clientes
El sistema MUST permitir crear, editar y desactivar clientes.

Campos requeridos: `nombre`. Campos opcionales: `apellido`, `teléfono`, `email`, `DNI`.

### REQ-CLI-2: Perfil de cliente
El sistema MUST mostrar en el perfil del cliente: sus vehículos, historial de servicios y ventas.

### REQ-CLI-3: Contacto por WhatsApp
El sistema MUST mostrar un botón que abra WhatsApp con el número del cliente si tiene teléfono registrado.

**Scenario: Abrir WhatsApp**
- GIVEN un cliente con teléfono registrado
- WHEN el operador hace clic en el botón WhatsApp
- THEN se abre `wa.me/{phone}` en nueva pestaña

### REQ-CLI-4: Búsqueda de clientes
El sistema MUST permitir buscar clientes por nombre, apellido, DNI o teléfono.

---

## 6. Módulo Vehículos

### REQ-VEH-1: Gestión de vehículos
El sistema MUST permitir crear y editar vehículos.

Campos requeridos: `patente` (única), `marca`, `modelo`. Campos opcionales: `año`, `motor`, `cliente`.

**Scenario: Patente duplicada**
- GIVEN una patente ya registrada
- WHEN se intenta crear otro vehículo con la misma patente
- THEN el sistema MUST rechazar con error de unicidad

### REQ-VEH-2: Historial del vehículo
El sistema MUST mostrar todos los servicios realizados al vehículo, ordenados por fecha descendente.

### REQ-VEH-3: Vehículo sin propietario
El sistema MUST permitir registrar vehículos sin cliente asignado (clientId opcional).

---

## 7. Módulo Ventas

### REQ-VTA-1: Nueva venta
El sistema MUST permitir registrar una venta con uno o más productos. El cliente es opcional.

**Scenario: Venta con descuento**
- GIVEN un carrito con productos y un descuento aplicado
- WHEN se confirma la venta
- THEN `total = suma(items) - descuento`, el stock se decrementa y se registran movimientos

**Scenario: Venta sin cliente**
- GIVEN una venta sin cliente seleccionado
- WHEN se confirma
- THEN la venta se crea con `clientId = null`

### REQ-VTA-2: Cancelación de venta
El sistema MUST permitir cancelar una venta completada. Al cancelar, el stock de los productos MUST ser devuelto.

**Scenario: Cancelar venta**
- GIVEN una venta con status `completed`
- WHEN el operador la cancela
- THEN status cambia a `cancelled` y el stock de cada item se incrementa

### REQ-VTA-3: Listado de ventas
El sistema MUST listar ventas del día actual por defecto. MUST permitir filtrar por fecha y por cliente.

---

## 8. Módulo Proveedores

### REQ-PROV-1: Gestión de proveedores
El sistema MUST permitir crear, editar y desactivar proveedores.

Campos requeridos: `nombre`. Opcionales: `contacto`, `teléfono`, `email`, `dirección`.

### REQ-PROV-2: Productos asociados
El sistema MUST permitir vincular productos a un proveedor. La combinación `(proveedor, producto)` MUST ser única.

### REQ-PROV-3: Historial de compras
El sistema MUST registrar compras asociadas a un proveedor con monto total y notas.

---

## 9. Módulo Reportes

### REQ-REP-1: KPIs del período
El sistema MUST mostrar métricas clave para un período seleccionable: total de ventas, cantidad de servicios, ingresos totales.

### REQ-REP-2: Gráfico de ventas
El sistema MUST mostrar un gráfico de ventas por período (usando Recharts).

### REQ-REP-3: Selector de período
El sistema MUST permitir al operador seleccionar el rango de fechas para los reportes.

---

## 10. Dashboard

### REQ-DASH-1: Estadísticas del día
El sistema MUST mostrar en el dashboard: ventas del día, servicios del día, alertas de stock bajo.

---

## 11. Reglas de Negocio Transversales

| Regla | Descripción |
|-------|-------------|
| RN-01 | Todo movimiento de stock MUST tener razón registrada |
| RN-02 | Ventas y servicios decrementan stock automáticamente (transacción atómica) |
| RN-03 | Cancelar venta devuelve stock (transacción atómica) |
| RN-04 | Productos desactivados no aparecen en búsquedas de stock |
| RN-05 | Clientes y proveedores desactivados SHOULD mantenerse en el historial |
| RN-06 | Vehículos y clientes son opcionales en servicios y ventas respectivamente |

---

## 12. Pendientes / Fuera de Alcance MVP

| Feature | Estado | Notas |
|---------|--------|-------|
| Recordatorios automáticos por WhatsApp | Pendiente | Requiere integración con API de WhatsApp Business |
| Escáner de código de barras (móvil) | Pendiente | Para ingreso de stock desde celular |
| Análisis de rotación de productos | Pendiente | Reportes avanzados de stock |
| Facturación electrónica AFIP | No definido | Riesgo: requisito no validado con cliente |
| Migración de datos del sistema legacy | No definido | Riesgo: sistema legacy puede no exportar datos |
| Configuración de infraestructura/cloud | No definido | Proveedor de deployment no elegido |

---

## 13. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Sistema legacy no exporta datos | Alto | Reunión de relevamiento con cliente |
| AFIP no requerido | Medio | Validar en próxima reunión |
| Flujo operativo real difiere del modelado | Alto | Piloto con operador real antes de go-live |
