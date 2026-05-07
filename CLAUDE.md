# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

ERP-lite for an automotive service center ("Lavalle"). Manages clients, vehicles, maintenance services, inventory, sales, suppliers, car wash sessions, and reports. Built in Spanish.

Two distinct user roles:
- **admin** — Solvify (system operator), can access `/admin/*` routes for role assignment
- **owner** — Lubricentro staff, accesses the full dashboard

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint (flat config, eslint 9)
npm run seed      # Seed database: npx tsx prisma/seed.ts
```

Prisma migrations:
```bash
npx prisma migrate dev    # Run pending migrations
npx prisma studio         # Visual DB explorer
```

No test suite exists in this project.

## Architecture

### Route Groups

- `src/app/(auth)/` — Public routes: `/login`, `/pending`, `/auth/callback`
- `src/app/(dashboard)/` — Protected routes behind middleware auth check
- `src/app/api/` — REST API handlers (one folder per resource)

### Auth Flow

`src/middleware.ts` intercepts every request:
1. No session → redirect to `/login`
2. Session but no role in `user.app_metadata.role` → redirect to `/pending`
3. Accessing `/admin/*` without `admin` role → redirect to `/`
4. Otherwise → pass through

Three Supabase client variants exist for different contexts:
- `src/lib/supabase/client.ts` — browser (client components)
- `src/lib/supabase/server.ts` — server components / route handlers (SSR cookies)
- `src/lib/supabase/admin.ts` — service role (admin API routes only)

### Data Layer

PostgreSQL accessed exclusively through Prisma (`src/lib/prisma.ts`). The client uses a lazy proxy singleton to avoid instantiation at build time — do not bypass this pattern.

Key model groups:
- **Inventory:** `Producto`, `Categoria`, `Marca`, `MovimientoStock`
- **CRM:** `Cliente`, `Vehiculo`
- **Operations:** `Servicio`, `ServicioProducto`
- **Sales:** `Venta`, `DetalleVenta`
- **Procurement:** `Proveedor`, `ProveedorProducto`, `Compra`
- **Car wash:** `TurnoLavaAuto`, `SesionLavaAuto`, `SesionProducto`, `ConfigLavaAuto`

### Server vs Client Component Split

**Server components** (page files under `(dashboard)/`) fetch data directly with Prisma and mark `export const dynamic = 'force-dynamic'` for real-time reads. Role info flows from middleware → server component → props.

**Client components** (`"use client"`) handle forms and interactivity. They POST/PATCH/DELETE through the `/api/` routes using `fetch()`. No global state library — local `useState` only.

### Form Pattern

All forms use react-hook-form + Zod:
```typescript
const schema = z.object({ ... })
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})
```

Validation messages are in Spanish. Success/error feedback goes through `sonner` toasts.

### Typing

Shared types live in `src/types/index.ts` — these are Prisma-generated types extended with relations (e.g. `ProductoWithRelations`, `VentaWithRelations`, `CartItem`). Prefer importing from there over inline Prisma types.

### UI

- Components: shadcn-ui base (Radix UI primitives) in `src/components/ui/`
- Styling: Tailwind CSS v4 — yellow-400 is the primary accent
- Icons: lucide-react
- Toasts: sonner (configured in dashboard layout)
- Animations: framer-motion (sidebar active state, page transitions via `template.tsx`)
- Onboarding tours: nextstepjs, tour definitions in `src/lib/tours.ts`

Path alias `@/*` resolves to `src/*`.
