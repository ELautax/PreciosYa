import type { Request, Response } from 'express'
import { z } from 'zod'

import { createLocal, getLocalsForUser, serializeLocal } from '../services/local.service.js'
import { sendSuccess } from '../utils/response.js'
import { AppError } from '../utils/AppError.js'

const createLocalSchema = z.object({
  name: z.string().min(1),
  address: z.union([z.string(), z.null()]).optional(),
})

export async function listLocals(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const locals = await getLocalsForUser(user.id)
  sendSuccess(res, { locals: locals.map(serializeLocal) })
}

export async function createLocalHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const body = createLocalSchema.parse(req.body)
  const local = await createLocal(user, {
    name: body.name,
    address: body.address,
  })
  sendSuccess(res, { local: serializeLocal(local) }, 201)
}
