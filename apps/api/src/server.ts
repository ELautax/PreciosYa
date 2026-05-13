import { env } from './config/env.js'
import { app } from './app.js'
import { initScheduler } from './jobs/ipc-scheduler.js'
import { prisma } from './lib/prisma.js'

async function shutdown(signal: string): Promise<void> {
  console.info(`${signal} recibido, cerrando…`)
  await prisma.$disconnect()
  process.exit(0)
}

async function main(): Promise<void> {
  const shouldConnectDb =
    env.NODE_ENV !== 'test' && env.DATABASE_URL !== undefined && env.DATABASE_URL !== ''

  if (shouldConnectDb) {
    await prisma.$connect()
  } else if (env.NODE_ENV === 'development') {
    console.warn(
      '[api] DATABASE_URL no configurada: iniciando API sin conexión a DB (rutas que usen Prisma fallarán)',
    )
  }

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`)
    if (shouldConnectDb) {
      initScheduler()
    }
  })

  process.on('SIGINT', () => {
    void shutdown('SIGINT')
  })
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM')
  })
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
