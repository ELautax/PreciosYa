import type { Request, Response } from 'express'
import { z } from 'zod'

import {
  getCategories,
  listCategoryTemplates,
  updateCategory,
} from '../services/category.service.js'
import { sendSuccess } from '../utils/response.js'
import { AppError } from '../utils/AppError.js'

const listQuerySchema = z.object({
  localId: z.string().uuid(),
})

const patchBodySchema = z
  .object({
    isActive: z.boolean().optional(),
    indexByUsd: z.boolean().optional(),
  })
  .refine((b) => b.isActive !== undefined || b.indexByUsd !== undefined, {
    message: 'Enviá isActive y/o indexByUsd',
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
  const patch: { isActive?: boolean; indexByUsd?: boolean } = {}
  if (body.isActive !== undefined) patch.isActive = body.isActive
  if (body.indexByUsd !== undefined) patch.indexByUsd = body.indexByUsd
  const category = await updateCategory(user.id, id, patch)
  sendSuccess(res, { category })
}
