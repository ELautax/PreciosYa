import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { env } from './config/env.js'
import { app } from './app.js'
import { initScheduler } from './jobs/ipc-scheduler.js'
import { prisma } from './lib/prisma.js'

const apiRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function runPendingMigrations(): void {
  if (env.NODE_ENV !== 'production') return
  try {
    console.info('[db] aplicando migraciones pendientes (prisma migrate deploy)…')
    execSync('npx prisma migrate deploy', {
      cwd: apiRoot,
      stdio: 'inherit',
      env: process.env,
    })
  } catch (error) {
    console.error(
      '[db] migrate deploy falló (¿DIRECT_URL 5432 inalcanzable desde Railway?). ' +
        'Aplicá el SQL en docs/FIX_MIGRACIONES_202606.md en Supabase.',
      error,
    )
  }
}

async function shutdown(signal: string): Promise<void> {
  console.info(`${signal} recibido, cerrando…`)
  await prisma.$disconnect()
  process.exit(0)
}

async function main(): Promise<void> {
  runPendingMigrations()
  await prisma.$connect()

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`)
    initScheduler()
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
