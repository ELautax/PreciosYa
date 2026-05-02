import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/config/env'

/** Cliente anon: solo Auth y Realtime en el browser (datos de negocio vía API). */
export const supabase: SupabaseClient | null =
  env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
    ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
    : null
