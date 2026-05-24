import type { Request, Response } from 'express'
import { z } from 'zod'

import {
  getCategories,
  listCategoryTemplates,
  setCategoryActive,
} from '../services/category.service.js'
import { sendSuccess } from '../utils/response.js'
import { AppError } from '../utils/AppError.js'

const listQuerySchema = z.object({
  localId: z.string().uuid(),
})

const patchBodySchema = z.object({
  isActive: z.boolean(),
})

export async function listCategories(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const q = listQuerySchema.parse(req.query)
  const categories = await getCategories(user.id, q.localId)
  sendSuccess(res, { categories })
}

export async function listCategoryTemplatesHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const templates = await listCategoryTemplates()
  sendSuccess(res, { templates })
}

export async function patchCategoryActiveHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const id = z.string().uuid().parse(req.params.id)
  const body = patchBodySchema.parse(req.body)
  const category = await setCategoryActive(user.id, id, body.isActive)
  sendSuccess(res, { category })
}
