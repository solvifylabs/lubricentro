// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveOrCreateTurno(tx: any): Promise<string> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await tx.turnoLavaAuto.findUnique({ where: { date: today } })

  if (!existing) {
    const turno = await tx.turnoLavaAuto.create({
      data: { date: today, startedAt: new Date() },
    })
    return turno.id
  }

  if (existing.endedAt) {
    await tx.turnoLavaAuto.update({
      where: { id: existing.id },
      data: { endedAt: null },
    })
  }

  return existing.id
}
