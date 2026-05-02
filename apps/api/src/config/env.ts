import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.env'),
})

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().max(65535).default(3001),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    DATABASE_URL: z.string().url().optional(),
    DIRECT_URL: z.string().url().optional(),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    SUPABASE_ANON_KEY: z.string().min(1).optional(),
    JWT_SECRET: z.string().min(32).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
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
