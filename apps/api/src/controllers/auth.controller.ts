import type { Request, Response } from 'express'
import { z } from 'zod'

import { sendSuccess } from '../utils/response.js'
import { verifyToken } from '../lib/supabase.js'
import {
  refreshSessionFromSupabase,
  signOutSupabaseUser,
  syncUserFromSupabase,
} from '../services/auth.service.js'
import { sendWelcomeEmail } from '../services/email.service.js'
import { createNotification } from '../services/notification.service.js'
import { AppError } from '../utils/AppError.js'
import type { User } from '@prisma/client'

const googleLoginSchema = z.object({
  accessToken: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    googleId: user.googleId,
    plan: user.plan,
    planExpiresAt: user.planExpiresAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

function tokenFromRequest(req: Request): string | undefined {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }
  return undefined
}

export async function googleLogin(req: Request, res: Response): Promise<void> {
  const fromBody = googleLoginSchema.safeParse(req.body)
  const accessToken = fromBody.success
    ? fromBody.data.accessToken
    : tokenFromRequest(req)

  if (!accessToken) {
    throw new AppError({
      statusCode: 400,
      message: 'Enviá accessToken en el JSON o Authorization: Bearer …',
      code: 'AUTH_BODY_INVALID',
    })
  }

  const authUser = await verifyToken(accessToken)
  const { user, isNew } = await syncUserFromSupabase(authUser)

  if (isNew) {
    void sendWelcomeEmail(user.email, user.name)
    void createNotification({
      userId: user.id,
      type: 'WELCOME',
      title: 'Bienvenido a PreciosYa',
      body: 'Tu cuenta se creó correctamente. Ya podés empezar a cargar productos.',
    })
  }

  sendSuccess(res, { user: serializeUser(user) })
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError({
      statusCode: 400,
      message: 'refreshToken es obligatorio',
      code: 'VALIDATION_ERROR',
    })
  }
  const tokens = await refreshSessionFromSupabase(parsed.data.refreshToken)
  sendSuccess(res, tokens)
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError({ statusCode: 401, message: 'No autenticado', code: 'UNAUTHORIZED' })
  }
  await signOutSupabaseUser(req.user.id)
  sendSuccess(res, { ok: true })
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError({ statusCode: 401, message: 'No autenticado', code: 'UNAUTHORIZED' })
  }
  sendSuccess(res, { user: serializeUser(req.user) })
}
