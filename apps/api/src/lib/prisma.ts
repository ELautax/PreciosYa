import { PrismaClient, type Prisma } from '@prisma/client'

import { env } from '../config/env.js'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { level: 'warn', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
            { level: 'query', emit: 'event' },
          ]
        : [{ level: 'warn', emit: 'stdout' }, { level: 'error', emit: 'stdout' }],
  })

  client.$on('query', (e: Prisma.QueryEvent) => {
    const ms = e.duration
    if (ms > 500) {
      // Consultas lentas: útil para optimizar en producción
      console.warn(`[prisma] consulta lenta (${ms}ms)`)
    }
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
