import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3001'),
  VITE_SUPABASE_URL: z.union([z.string().url(), z.literal('')]).optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
})

export type WebEnv = z.infer<typeof schema>

function readEnv(): WebEnv {
  return schema.parse({
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ?? '',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  })
}

export const env = readEnv()
