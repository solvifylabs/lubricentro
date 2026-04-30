import { describe, it, expect, vi, beforeEach } from "vitest"
import { resolveOrCreateTurno } from "@/lib/turno"

const FIXED_DATE = new Date("2026-04-30T12:00:00.000Z")
// Mirror exactly what resolveOrCreateTurno does: local midnight, not UTC
const TODAY_MIDNIGHT = new Date(FIXED_DATE)
TODAY_MIDNIGHT.setHours(0, 0, 0, 0)

function makeTx(overrides: {
  findUnique?: ReturnType<typeof vi.fn>
  create?: ReturnType<typeof vi.fn>
  update?: ReturnType<typeof vi.fn>
} = {}) {
  return {
    turnoLavaAuto: {
      findUnique: overrides.findUnique ?? vi.fn(),
      create: overrides.create ?? vi.fn(),
      update: overrides.update ?? vi.fn(),
    },
  }
}

describe("resolveOrCreateTurno", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_DATE)
  })

  it("creates a new turno when none exists for today", async () => {
    const created = { id: "turno-new" }
    const tx = makeTx({
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(created),
    })

    const id = await resolveOrCreateTurno(tx)

    expect(tx.turnoLavaAuto.findUnique).toHaveBeenCalledWith({
      where: { date: TODAY_MIDNIGHT },
    })
    expect(tx.turnoLavaAuto.create).toHaveBeenCalledWith({
      data: { date: TODAY_MIDNIGHT, startedAt: expect.any(Date) },
    })
    expect(id).toBe("turno-new")
  })

  it("returns existing turno id when turno is open", async () => {
    const existing = { id: "turno-open", endedAt: null }
    const tx = makeTx({
      findUnique: vi.fn().mockResolvedValue(existing),
    })

    const id = await resolveOrCreateTurno(tx)

    expect(tx.turnoLavaAuto.create).not.toHaveBeenCalled()
    expect(tx.turnoLavaAuto.update).not.toHaveBeenCalled()
    expect(id).toBe("turno-open")
  })

  it("reopens a closed turno (endedAt set) and returns its id", async () => {
    const existing = { id: "turno-closed", endedAt: new Date("2026-04-30T10:00:00Z") }
    const tx = makeTx({
      findUnique: vi.fn().mockResolvedValue(existing),
      update: vi.fn().mockResolvedValue({ ...existing, endedAt: null }),
    })

    const id = await resolveOrCreateTurno(tx)

    expect(tx.turnoLavaAuto.update).toHaveBeenCalledWith({
      where: { id: "turno-closed" },
      data: { endedAt: null },
    })
    expect(tx.turnoLavaAuto.create).not.toHaveBeenCalled()
    expect(id).toBe("turno-closed")
  })
})
