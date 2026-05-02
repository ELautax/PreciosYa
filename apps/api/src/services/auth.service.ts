import type { User as AuthUser } from '@supabase/supabase-js'
import type { User } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/AppError.js'

/** Crea o actualiza el usuario de negocio a partir del usuario de Supabase Auth. */
export async function syncUserFromSupabase(authUser: AuthUser): Promise<User> {
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

  const fallbackName = email.includes('@')
    ? (email.split('@')[0] ?? email)
    : email

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

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, ...(googleSub ? [{ googleId: googleSub }] : [])],
    },
  })

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        avatarUrl: avatarUrl ?? existing.avatarUrl,
        googleId: googleSub ?? existing.googleId,
      },
    })
  }

  return prisma.user.create({
    data: {
      email,
      name,
      avatarUrl,
      googleId: googleSub ?? null,
    },
  })
}
