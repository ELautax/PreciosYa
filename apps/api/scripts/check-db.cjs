/* Desde apps/api: node scripts/check-db.cjs */
const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
  override: true,
})

const { PrismaClient } = require('@prisma/client')

/** Sin exponer contraseña: sugiere pooler si la URL es la directa IPv6-typical de Supabase */
function printSupabaseHint(databaseUrl) {
  if (!databaseUrl || typeof databaseUrl !== 'string') return
  try {
    const normalized = databaseUrl.trim().replace(/^postgresql:\/\//i, 'http://')
    const u = new URL(normalized)
    const host = u.hostname
    if (
      /^db\.[a-z0-9]+\.supabase\.co$/i.test(host) &&
      !host.includes('pooler')
    ) {
      console.error('')
      console.error(
        'Sugerencia: estás usando la URI directa (host db.*.supabase.co). En muchos equipos Windows / redes IPv4-only eso no enruta (IPv6).',
      )
      console.error(
        'Probá Session pooler: Dashboard → Connect → Session, y pegá esa URI en DATABASE_URL.',
      )
      console.error(
        'Guía: docs/SUPABASE_ENV.md § 7 · https://supabase.com/docs/guides/database/connecting-to-postgres',
      )
    }
  } catch {
    // ignorar parseo
  }
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
