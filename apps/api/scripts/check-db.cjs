const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
  override: true,
})

const { PrismaClient } = require('@prisma/client')

function printSupabaseHint(databaseUrl) {
  if (!databaseUrl || typeof databaseUrl !== 'string') return
  try {
    const normalized = databaseUrl.trim().replace(/^postgresql:\/\//i, 'http://')
    const host = new URL(normalized).hostname
    if (/^db\.[a-z0-9]+\.supabase\.co$/i.test(host) && !host.includes('pooler')) {
      console.error('')
      console.error(
        'URI directa (db.*.supabase.co): si falla en Windows, usá Session pooler en Dashboard → Connect.',
      )
      console.error('docs/SUPABASE_ENV.md § 7')
    }
  } catch {}
}

const prisma = new PrismaClient()

prisma
  .$connect()
  .then(() => {
    console.log('Prisma: conexión OK')
    return prisma.$disconnect()
  })
  .catch((err) => {
    console.error('Prisma:', err.message)
    printSupabaseHint(process.env.DATABASE_URL)
    process.exit(1)
  })
