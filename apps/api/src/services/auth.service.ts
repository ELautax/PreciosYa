import type { User as AuthUser } from '@supabase/supabase-js'
import type { User } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { getSupabaseAdmin } from '../lib/supabase.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

export type SyncUserResult = {
  user: User
  isNew: boolean
}

/** Alinea `users.id` con `auth.users.id` (UUID de Supabase) para sesiones y admin API. */
export async function syncUserFromSupabase(authUser: AuthUser): Promise<SyncUserResult> {
  const email = authUser.email
  if (!email) {
    throw new AppError({
      statusCode: 400,
      message: 'El usuario de Auth no tiene email',
      code: 'AUTH_EMAIL_MISSING',
    })
  }

  const meta = authUser.user_metadata as Record<string, unknown> | undefined
  const googleSub =
    typeof meta?.sub === 'string'
      ? meta.sub
      : typeof meta?.provider_id === 'string'
        ? meta.provider_id
        : undefined

  const fallbackName = email.includes('@') ? (email.split('@')[0] ?? email) : email

  const name: string =
    typeof meta?.full_name === 'string'
      ? meta.full_name
      : typeof meta?.name === 'string'
        ? meta.name
        : fallbackName

  const avatarUrl =
    typeof meta?.avatar_url === 'string'
      ? meta.avatar_url
      : typeof meta?.picture === 'string'
        ? meta.picture
        : null

  const prior = await prisma.user.findUnique({ where: { id: authUser.id } })

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      email,
      name,
      avatarUrl,
      googleId: googleSub ?? null,
    },
    update: {
      email,
      name,
      avatarUrl,
      googleId: googleSub ?? null,
    },
  })

  return { user, isNew: prior === null }
}

export async function refreshSessionFromSupabase(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new AppError({
      statusCode: 503,
      message: 'Configurá SUPABASE_URL y SUPABASE_ANON_KEY para renovar sesión',
      code: 'SUPABASE_ANON_MISSING',
    })
  }

  const base = env.SUPABASE_URL.replace(/\/$/, '')
  const res = await fetch(`${base}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!res.ok) {
    throw new AppError({
      statusCode: 401,
      message: 'Refresh token inválido o expirado',
      code: 'INVALID_REFRESH_TOKEN',
    })
  }

  const json = (await res.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  }
}

export async function signOutSupabaseUser(userId: string): Promise<void> {
  const admin = getSupabaseAdmin()
  const { error } = await admin.auth.admin.signOut(userId)
  if (error) {
    throw new AppError({
      statusCode: 502,
      message: error.message,
      code: 'SUPABASE_SIGNOUT_FAILED',
    })
  }
}
