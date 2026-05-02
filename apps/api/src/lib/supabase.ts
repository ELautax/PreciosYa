import { createClient, type SupabaseClient, type User as SupabaseAuthUser } from '@supabase/supabase-js'

import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

let admin: SupabaseClient | null = null

function getSupabaseAdminOrThrow(): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError({
      statusCode: 503,
      message: 'Supabase no está configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
      code: 'SUPABASE_NOT_CONFIGURED',
    })
  }
  if (!admin) {
    admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return admin
}

/** Cliente admin (service_role): solo backend. */
export function getSupabaseAdmin(): SupabaseClient {
  return getSupabaseAdminOrThrow()
}

/** Verifica JWT de Supabase Auth y devuelve el usuario de Auth. */
export async function verifyToken(accessToken: string): Promise<SupabaseAuthUser> {
  const client = getSupabaseAdminOrThrow()
  const { data, error } = await client.auth.getUser(accessToken)
  if (error || !data.user) {
    throw new AppError({
      statusCode: 401,
      message: 'Token inválido o expirado',
      code: 'INVALID_TOKEN',
    })
  }
  return data.user
}
