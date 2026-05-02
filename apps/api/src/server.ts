import { env } from './config/env.js'
import { app } from './app.js'
import { prisma } from './lib/prisma.js'

async function shutdown(signal: string): Promise<void> {
  console.info(`${signal} recibido, cerrando…`)
  await prisma.$disconnect()
  process.exit(0)
}

async function main(): Promise<void> {
  await prisma.$connect()

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`)
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
