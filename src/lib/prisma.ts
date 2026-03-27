import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (!globalThis.prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
    globalThis.prisma = new PrismaClient({ adapter })
  }
  return globalThis.prisma
}

// Lazy proxy so PrismaClient is only instantiated on first actual DB call,
// not at module evaluation time (avoids build-time errors when DATABASE_URL is absent).
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    return getPrismaClient()[prop as keyof PrismaClient]
  },
})

export default prisma
