# Testing Strategy — lubricentro

Single source of truth for the testing approach, toolchain, conventions, and execution plan.

---

## Current State

- No test runner existed before this document
- TypeScript (`tsc --noEmit`) and ESLint are the only automated quality gates
- All business logic lives in Next.js App Router API route handlers backed by Prisma + PostgreSQL
- Auth is Supabase JWT enforced in `src/middleware.ts`

---

## Toolchain

| Layer | Tool | Why |
|-------|------|-----|
| Unit + Integration | **Vitest** | Native ESM, fast, works with Next.js App Router without ceremony. Better than Jest for this stack. |
| Route handler testing | **next-test-api-route-handler** | Wraps route handlers without a full server (Tier 2+) |
| E2E | **Playwright** | Best-in-class for Next.js; can test auth redirects, real browser (Tier 3) |
| Client component mocking | **MSW** | Intercepts `fetch()` in client components during component tests (Tier 4) |
| Path alias resolution | **vite-tsconfig-paths** | Resolves `@/*` → `src/*` inside Vitest |
| Pre-commit enforcement | **Husky** | Runs `pnpm test` before every commit; blocks commit on failure |
| DB isolation (Tier 2+) | **Separate Postgres schema** | Prisma transactions can't be reliably faked — mock libraries miss edge cases |

---

## Critical Bug Found During Exploration

**`PATCH /api/ventas/[id]`** — cancelling a sale only flips `status = "cancelled"`.
It does **NOT** restore `stock` on `Producto`, nor create a compensating `MovimientoStock` entry.
Stock stays permanently decremented. This is silent data corruption.

**Must be fixed in Tier 2 with a failing test first (red → green).**

---

## Testing Tiers

### Tier 1 — Pure Unit Tests (no DB, no network)
Run in milliseconds. Zero infrastructure required.

**Targets:**
- `src/lib/auth/roles.ts` — `getRole`, `hasRole`, `isAdmin` (pure functions)
- `src/lib/turno.ts` — `resolveOrCreateTurno` with a mocked Prisma `tx`

**Status:** ✅ Implemented

---

### Tier 2 — Integration Tests (real DB, route handler level)
Highest value layer. Tests actual transaction chains without a browser.
Requires `next-test-api-route-handler` and a dedicated test PostgreSQL schema.

**Targets (priority order):**
1. `POST /api/ventas` → Venta created, stock decremented, MovimientoStock created — atomically
2. `POST /api/servicios` → same pattern
3. `POST /api/lava-auto` → same pattern
4. `PATCH /api/ventas/[id]` cancel → stock IS restored + MovimientoStock entry created (**bug fix**)
5. `DELETE /api/stock/[id]` → soft delete (`active = false`), not hard delete
6. `POST /api/stock` with `stock > 0` → MovimientoStock "entry" created

**Status:** 🔜 Next phase

---

### Tier 3 — E2E Tests (Playwright, real browser)
Highest setup cost. Covers auth + UI flows integration tests can't reach.

**Targets (priority order):**
1. Unauthenticated request → redirects to `/login`
2. Authenticated, no role → redirects to `/pending`
3. Non-admin accessing `/admin/*` → redirects to `/`
4. Full venta creation wizard → submits → appears in venta list
5. Full servicio with products → stock decremented visible in stock page

**Status:** 🔜 Future phase

---

### Tier 4 — Component Tests (optional, lower ROI)
Forms already have Zod validation client-side. Add only when UI logic grows complex.

**Potential targets:**
- `VentaWizard` cart interactions (add/remove items, discount)
- `ServicioForm` product selector behavior

**Status:** ⏸ Not prioritized

---

## File Conventions

- Test files colocated in `__tests__/` folders next to the source
- File naming: `<module>.test.ts`
- Vitest globals enabled (`describe`, `it`, `expect`, `vi` without imports)

```
src/
  lib/
    auth/
      __tests__/
        roles.test.ts        ✅ Tier 1
    __tests__/
      turno.test.ts          ✅ Tier 1
  app/
    api/
      ventas/
        __tests__/
          route.test.ts      🔜 Tier 2
      servicios/
        __tests__/
          route.test.ts      🔜 Tier 2
      lava-auto/
        __tests__/
          route.test.ts      🔜 Tier 2
      stock/
        __tests__/
          route.test.ts      🔜 Tier 2
```

---

## Module Interrelationship Map

The stock chain runs through three independent operation modules. Any regression in this shared pattern breaks all three:

```
Venta POST ──────┐
Servicio POST ───┼──► prisma.$transaction ──► stock.decrement + MovimientoStock.create
LavaAuto POST ───┘

resolveOrCreateTurno ◄── shared by all three (date-sensitive, side-effectful)

Venta PATCH (cancel) ──► BUG: should restore stock but doesn't
```

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Prisma lazy proxy connects on first call — needs `DATABASE_URL` in test env | Use `.env.test` with a dedicated test DB connection string |
| `resolveOrCreateTurno` uses `new Date()` — date-sensitive | Mock `Date` with `vi.setSystemTime()` in tests that care about date |
| Supabase auth can't be tested in unit/integration without mocking | Mock `createServerClient` from `@supabase/ssr` at module level |
| No input validation on API routes — bad payloads give Prisma errors, not 400s | Fix before writing the full Tier 2 suite |
| `moduleResolution: "bundler"` in tsconfig — Vitest needs `vite-tsconfig-paths` | Already included in Vitest config |

---

## Pre-commit Hook

Husky runs `pnpm test` (Vitest in run mode) before every commit.
A failing test **blocks the commit**. This is non-negotiable.

```
.husky/pre-commit → pnpm test
```

To bypass in a genuine emergency only: `git commit --no-verify`
Document WHY whenever `--no-verify` is used.

---

## Setup Steps (completed)

1. ✅ Install `vitest`, `vite-tsconfig-paths`, `@vitest/coverage-v8`
2. ✅ Create `vitest.config.ts`
3. ✅ Add `test` + `test:watch` scripts to `package.json`
4. ✅ Write Tier 1 tests (`roles.test.ts`, `turno.test.ts`)
5. ✅ Install `husky`
6. ✅ Configure pre-commit hook

## Next Steps

- [ ] Tier 2: install `next-test-api-route-handler`, set up `.env.test`, write integration tests
- [ ] Fix `PATCH /api/ventas/[id]` cancellation bug (with test first)
- [ ] Tier 3: install Playwright, write auth flow E2E tests
