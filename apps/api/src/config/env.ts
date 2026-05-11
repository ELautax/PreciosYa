import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.env'),
  override: true,
})

const emptyToUndefined = (v: unknown): unknown =>
  typeof v === 'string' && v.trim() === '' ? undefined : v

/**
 * Supabase Session pooler (PgBouncer en modo transacción, típico puerto 6543) invalida
 * prepared statements entre requests. Sin `pgbouncer=true`, Prisma falla con:
 * PostgresError 26000 — prepared statement "sN" does not exist (intermitente en serverless).
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management/configure-pg-bouncer
 */
function appendPgbouncerTrueIfSupabasePooler(databaseUrl: string): string {
  const lower = databaseUrl.toLowerCase()
  const looksLikePooler =
    lower.includes('pooler.supabase.com') || /:6543([/?]|$)/.test(lower)
  if (!looksLikePooler) return databaseUrl
  if (/[?&]pgbouncer=true(?:&|$)/i.test(databaseUrl)) return databaseUrl
  return databaseUrl.includes('?')
    ? `${databaseUrl}&pgbouncer=true`
    : `${databaseUrl}?pgbouncer=true`
}

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().max(65535).default(3001),
    /** Orígenes permitidos para CORS en producción (lista separada por coma). Debe incluir la URL exacta del front (ej. https://tu-app.vercel.app). */
    FRONTEND_URL: z
      .string()
      .default('http://localhost:5173')
      .transform((raw) =>
        raw
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      )
      .pipe(z.array(z.string().url()).min(1)),
    DATABASE_URL: z.preprocess((v) => {
      const s = emptyToUndefined(v)
      if (typeof s !== 'string') return undefined
      return appendPgbouncerTrueIfSupabasePooler(s.trim())
    }, z.string().url().optional()),
    DIRECT_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
    SUPABASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
    SUPABASE_SERVICE_ROLE_KEY: z.preprocess(
      emptyToUndefined,
      z.string().min(1).optional(),
    ),
    ADMIN_EMAILS: z.preprocess(emptyToUndefined, z.string().optional()),
    SUPABASE_ANON_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    JWT_SECRET: z.preprocess(emptyToUndefined, z.string().min(32).optional()),
    RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    INDEC_API_BASE_URL: z
      .string()
      .url()
      .default('https://apis.datos.gob.ar/series/api'),
    BCRA_API_BASE_URL: z.string().url().default('https://api.bcra.gob.ar'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'production') return

    const req = (key: string, v: string | undefined): void => {
      if (v === undefined || v === '') {
        ctx.addIssue({
          code: 'custom',
          message: `${key} es obligatorio cuando NODE_ENV=production`,
          path: [key],
        })
      }
    }

    req('DATABASE_URL', data.DATABASE_URL)
    req('DIRECT_URL', data.DIRECT_URL)
    req('SUPABASE_URL', data.SUPABASE_URL)
    req('SUPABASE_SERVICE_ROLE_KEY', data.SUPABASE_SERVICE_ROLE_KEY)
    req('SUPABASE_ANON_KEY', data.SUPABASE_ANON_KEY)
    req('JWT_SECRET', data.JWT_SECRET)
    req('RESEND_API_KEY', data.RESEND_API_KEY)
  })

export type Env = z.infer<typeof schema>

export const env: Env = schema.parse(process.env)

/** Prisma lee `process.env.DATABASE_URL`; alinear con el valor ya normalizado (p. ej. `pgbouncer=true`). */
if (env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL
}
