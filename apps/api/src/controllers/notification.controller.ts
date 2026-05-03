import type { Request, Response } from 'express'
import { z } from 'zod'

import {
  getUnreadCount,
  getUserNotifications,
  markAllAsRead,
  markAsRead,
} from '../services/notification.service.js'
import { AppError } from '../utils/AppError.js'
import { sendSuccess } from '../utils/response.js'

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

function requireUser(req: Request): { id: string } {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  return { id: user.id }
}

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const q = listQuerySchema.parse(req.query)
  const data = await getUserNotifications(user.id, q.page, q.limit)
  sendSuccess(res, data)
}

export async function unreadCount(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const count = await getUnreadCount(user.id)
  sendSuccess(res, { count })
}

export async function markOneRead(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const id = z.string().uuid().parse(req.params.id)
  const ok = await markAsRead(user.id, id)
  if (!ok) {
    throw new AppError({
      statusCode: 404,
      message: 'Notificación no encontrada',
      code: 'NOTIFICATION_NOT_FOUND',
    })
  }
  sendSuccess(res, { ok: true })
}

export async function markReadAll(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const updated = await markAllAsRead(user.id)
  sendSuccess(res, { updated })
}
