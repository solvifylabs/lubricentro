# Lubricentro — Project Specifications
**Client**: Lubricentro, Cipolletti, Río Negro
**Last updated**: 2026-04-23 — v0.3 (gaps cerrados tras comparación con lubri_proposal_v.2.md)

---

## 1. Overview

Sistema web de gestión operativa para lubricentro. Actúa como **complemento** al sistema de facturación legacy existente — no lo reemplaza. Accesible desde computadora (desktop-first), cloud.

El sistema cubre dos unidades de negocio:
- **Lubricentro**: ~3 services por día (cambio de aceite y filtros)
- **Lava auto**: 15–30 vehículos por día — mayor volumen operativo

**Operado principalmente por una persona.** El diseño debe minimizar la fricción: registrar un service o una venta debe tomar menos de un minuto.

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
Campos opcionales: `código`, `marca`, `unidad`, `stock inicial`, `stock mínimo`, `consumo esperado por lavado` (Lava Auto).

Soporte para unidades: `unidad` (aceite envasado) y `litro` (aceite a granel/tambor).

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
El sistema SHOULD mostrar visualmente los productos cuyo `stock <= minStock`. Las alertas MUST ser configurables por producto (`minStock`).

**Scenario: Filtro de stock bajo**
- GIVEN productos con stock por debajo del mínimo
- WHEN el operador activa el filtro `lowStock`
- THEN solo se muestran esos productos

### REQ-STOCK-4: Categorías y marcas
El sistema MUST permitir gestionar categorías y marcas como entidades independientes con nombre único.

### REQ-STOCK-5: Búsqueda de productos
El sistema MUST permitir buscar productos por nombre o código (case-insensitive). MUST permitir filtrar por categoría.

### REQ-STOCK-6: Actualización de precios
El sistema MUST permitir actualizar precios de forma individual. SHOULD permitir actualización masiva de precios por categoría o marca.

---

## 4. Módulo Servicios — Lubricentro

### REQ-SVC-1: Registro de servicio (wizard)
El sistema MUST registrar servicios mediante un flujo guiado paso a paso:
1. Elegir o crear cliente (opcional)
2. Elegir o crear vehículo (requerido)
3. Seleccionar productos utilizados con cantidades
4. Resumen y confirmación

Campos requeridos: `vehículo`, `fecha de servicio`, `monto`.
Campos opcionales: `cliente`, `kilometraje actual`, `próximo service km`, `próxima fecha de service`, `notas`, `productos utilizados`.

**Scenario: Servicio con productos**
- GIVEN un servicio nuevo con productos cargados
- WHEN se confirma
- THEN se crea el Servicio, se crean los ServicioProducto, se decrementa el stock de cada producto y se registran movimientos tipo `exit`

**Scenario: Cálculo de próximo service**
- GIVEN un servicio con `kilometraje` cargado
- WHEN se confirma
- THEN `nextServiceKm = kilometraje + 10.000` se calcula automáticamente (editable por el operador)

**Scenario: Servicio sin cliente**
- GIVEN un vehículo sin cliente asignado
- WHEN se registra un servicio
- THEN el sistema MUST permitirlo (clientId es opcional)

### REQ-SVC-2: Historial de servicios
El sistema MUST listar servicios ordenados por fecha descendente. MUST permitir buscar por patente de vehículo o nombre de cliente. MUST permitir filtrar por fecha.

### REQ-SVC-3: Detalle de servicio
El sistema MUST mostrar todos los datos del servicio incluyendo productos utilizados, datos del vehículo y datos del cliente.

---

## 5. Módulo Lava Auto

### REQ-LAVA-1: Registro de sesión de lavado
El sistema MUST permitir registrar una sesión de lavado (un vehículo) con los productos consumidos y un monto cobrado.

Campos requeridos: `fecha`, `monto`.
Campos opcionales: `patente` (texto libre — se permiten lavados anónimos sin patente), `productos consumidos con cantidades`, `notas`, `turnoId`.

El monto se pre-completa desde el precio de lavado configurado (ver REQ-LAVA-5) y MUST ser editable por el operador en el momento del registro.

**Scenario: Registro de sesión con consumo**
- GIVEN una sesión con patente opcional, productos cargados y monto confirmado
- WHEN se confirma
- THEN se crea la SesionLavaAuto, el stock de cada producto se decrementa y se registran movimientos tipo `exit` con razón `Lavado #<id>`. Si hay un turno activo, la sesión se vincula automáticamente.

**Scenario: Lavado anónimo**
- GIVEN que el operador no ingresa patente
- WHEN se confirma la sesión
- THEN la sesión se crea con `plate = null` y se muestra como "Anónimo" en el historial.

### REQ-LAVA-2: Control de rendimiento
El sistema MUST comparar la cantidad consumida de cada producto con la cantidad esperada por sesión.

La cantidad esperada MUST ser configurable por producto. La diferencia (consumido vs. esperado) SHOULD mostrarse visualmente para detectar desvíos.

**Scenario: Desvío de consumo detectado**
- GIVEN el consumo total diario de un producto supera en más del 10% el esperado (`consumido > esperado * 1.1`)
- WHEN el operador visualiza el resumen diario en `/lava-auto`
- THEN el sistema MUST marcar el producto con alerta visual de desvío ("Desvío")

> **Decisión de implementación** (abril 2026): el rendimiento se mide por lavado individual (`expectedConsumptionPerWash` en `Producto`). El total esperado se calcula como `expectedPerWash × cantidadLavadosDelDía`. Umbral de alerta: >10% sobre lo esperado. Criterio por tipo de vehículo queda para Fase 2.

### REQ-LAVA-3: Seguimiento por producto y marca
El sistema MUST permitir filtrar y agrupar el historial de sesiones por producto o marca.
Esto permite comparar rendimiento entre marcas alternativas (ej.: Toxijame vs. genérico).

### REQ-LAVA-4: Totales diarios
El sistema MUST mostrar un resumen de consumo total de productos por día.

### REQ-LAVA-5: Gestión de turno (turno de trabajo)
El sistema MUST permitir al operador iniciar y cerrar un turno de lava auto.

Un turno representa la jornada de trabajo del lava auto (inicio y fin del día operativo). Las sesiones de lavado se vinculan al turno activo de forma automática.

Solo puede haber un turno activo por día. El sistema MUST rechazar la apertura de un segundo turno si ya existe uno activo.

**Scenario: Iniciar turno**
- GIVEN no hay turno activo
- WHEN el operador hace clic en "Iniciar turno" desde el Dashboard
- THEN se crea un TurnoLavaAuto con `startedAt = now()` y se muestra el estado activo con hora de inicio y contador de lavados

**Scenario: Cerrar turno**
- GIVEN hay un turno activo
- WHEN el operador hace clic en "Cerrar turno"
- THEN se establece `endedAt = now()` y el widget vuelve al estado inactivo

**Scenario: Turno ya activo**
- GIVEN ya existe un turno activo para el día
- WHEN se intenta iniciar otro turno
- THEN el sistema MUST responder con error 409 Conflict

---

## 6. Módulo Clientes

### REQ-CLI-1: Gestión de clientes
El sistema MUST permitir crear, editar y desactivar clientes.

Campos requeridos: `nombre`. Campos opcionales: `apellido`, `teléfono`, `email`, `DNI`.

### REQ-CLI-2: Perfil de cliente
El sistema MUST mostrar en el perfil del cliente: sus vehículos, historial de servicios y ventas.
Un cliente MUST poder tener múltiples vehículos registrados.

### REQ-CLI-3: Contacto por WhatsApp
El sistema MUST mostrar un botón que abra WhatsApp con el número del cliente si tiene teléfono registrado.

**Scenario: Abrir WhatsApp**
- GIVEN un cliente con teléfono registrado
- WHEN el operador hace clic en el botón WhatsApp
- THEN se abre `wa.me/{phone}` en nueva pestaña

### REQ-CLI-4: Búsqueda de clientes
El sistema MUST permitir buscar clientes por nombre, apellido, DNI o teléfono.

---

## 7. Módulo Vehículos

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

## 8. Módulo Ventas

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
El sistema MUST listar ventas del día actual por defecto. MUST permitir filtrar por fecha, por cliente y por producto.

---

## 9. Módulo Reportes

### REQ-REP-1: KPIs del período
El sistema MUST mostrar métricas clave para un período seleccionable: total de ventas, cantidad de servicios, ingresos totales.

### REQ-REP-2: Gráfico de ventas
El sistema MUST mostrar un gráfico de ventas por período (usando Recharts).

### REQ-REP-3: Selector de período
El sistema MUST permitir al operador seleccionar el rango de fechas para los reportes (día / semana / mes / rango personalizado).

### REQ-REP-4: Productos más usados
El sistema MUST mostrar un ranking de los productos más vendidos/utilizados en el período seleccionado.

### REQ-REP-5: Mejores clientes
El sistema MUST mostrar un ranking de los clientes con mayor volumen de servicios o ventas en el período.

### REQ-REP-6: Stock actual y movimiento por categoría
El sistema MUST mostrar el estado actual del stock y el movimiento (entradas/salidas) agrupado por categoría para el período seleccionado.

---

## 10. Dashboard

### REQ-DASH-1: Resumen del día
El sistema MUST mostrar en el dashboard: ventas del día, servicios del día, alertas de stock bajo, consumo de lava auto del día, y el estado del turno activo de lava auto (activo / inactivo con controles para iniciar o cerrar desde el propio dashboard).

### REQ-DASH-2: Productos con stock bajo
El sistema MUST destacar visualmente los productos con `stock <= minStock` desde el dashboard.

---

## 11. Requisitos No Funcionales

### NFR-01: Simplicidad operativa
El sistema MUST ser operable por una persona con bajo dominio digital sin necesidad de capacitación extensa. El flujo crítico (registrar service, registrar lavado, registrar venta) MUST completarse en menos de 60 segundos. Los formularios MUST usar lenguaje no técnico y minimizar campos obligatorios.

---

## 12. Reglas de Negocio Transversales

| Regla | Descripción |
|-------|-------------|
| RN-01 | Todo movimiento de stock MUST tener razón registrada |
| RN-02 | Ventas y servicios decrementan stock automáticamente (transacción atómica) |
| RN-03 | Cancelar venta devuelve stock (transacción atómica) |
| RN-04 | Registrar sesión de lava auto decrementa stock automáticamente (transacción atómica) |
| RN-05 | Productos desactivados no aparecen en búsquedas de stock |
| RN-06 | Clientes desactivados SHOULD mantenerse en el historial |
| RN-07 | Vehículos y clientes son opcionales en servicios y ventas respectivamente |
| RN-08 | El próximo service se calcula automáticamente como `kilometraje + 10.000 km` (editable) |
| RN-09 | El sistema actúa como complemento al sistema legacy de facturación — no hay integración de datos entre ellos |

---

## 13. Fuera de Alcance — Fase 1

Los siguientes módulos y funcionalidades quedan **explícitamente fuera del MVP** por decisión del cliente (segunda reunión, abril 2026):

| Feature | Estado | Notas |
|---------|--------|-------|
| **Módulo de proveedores** | Fuera de Fase 1 | No requerido en esta etapa. Queda en backlog para Fase 2. |
| **Facturación electrónica (AFIP)** | Fuera de Fase 1 | El cliente usa su sistema legacy para facturación. Sin integración. |
| **Migración de datos del sistema legacy** | Fuera de Fase 1 | El cliente comienza desde cero. No se migran datos existentes. |
| Recordatorios automáticos por WhatsApp | Fase 2 | Requiere integración con WhatsApp Business API |
| Acceso móvil (app o PWA) | Fase 2 | Desktop-first en Fase 1 |
| Reportes avanzados con exportación Excel/PDF | Fase 2 | Reportes básicos cubiertos en Fase 1 |
| Escáner de código de barras | Fase 2 | Para ingreso de stock desde celular |
| Roles y permisos para múltiples usuarios | Fase 2 | Un solo operador en Fase 1 |

---

## 14. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Criterio de rendimiento en lava auto | Bajo | **Resuelto (abril 2026)**: se implementó comparación por lavado individual con umbral >10%. Criterio por tipo de vehículo queda para Fase 2. |
| Categorías de lavado y tipos de vehículo sin relevar | Medio | Relevar con el cliente los tipos de servicio y vehículos del lava auto. Reservado para Fase 2. |
| Catálogo inicial de productos vacío | Medio | El cliente deberá cargar productos desde cero. Considerar sesión de carga asistida |
| Infraestructura y hosting no definidos | Bajo | Definir quién contrata y administra el servidor cloud. Puede incluirse en suscripción mensual |
| Flujo operativo real difiere del modelado | Alto | Piloto con el operador real antes del go-live |
