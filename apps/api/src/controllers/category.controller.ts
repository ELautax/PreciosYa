import type { Request, Response } from 'express'
import { z } from 'zod'

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/category.service.js'
import { sendSuccess } from '../utils/response.js'
import { AppError } from '../utils/AppError.js'

const listQuerySchema = z.object({
  localId: z.string().uuid(),
})

const createBodySchema = z.object({
  localId: z.string().uuid(),
  name: z.string().min(1),
  colorHex: z.union([z.string(), z.null()]).optional(),
})

const updateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    colorHex: z.union([z.string(), z.null()]).optional(),
  })
  .strict()

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

export async function createCategoryHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const body = createBodySchema.parse(req.body)
  const category = await createCategory(user.id, {
    localId: body.localId,
    name: body.name,
    ...(body.colorHex !== undefined ? { colorHex: body.colorHex } : {}),
  })
  sendSuccess(res, { category }, 201)
}

export async function updateCategoryHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const id = z.string().uuid().parse(req.params.id)
  const body = updateBodySchema.parse(req.body)
  const patch: { name?: string; colorHex?: string | null } = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.colorHex !== undefined) patch.colorHex = body.colorHex
  const category = await updateCategory(user.id, id, patch)
  sendSuccess(res, { category })
}

export async function deleteCategoryHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const id = z.string().uuid().parse(req.params.id)
  await deleteCategory(user.id, id)
  sendSuccess(res, { ok: true })
}
