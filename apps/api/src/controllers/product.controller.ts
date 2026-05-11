import type { Request, Response } from 'express'
import { z } from 'zod'

import {
  bulkUpdateByPercentage,
  createProduct,
  deleteProduct,
  getProductById,
  getProductHistory,
  getProducts,
  updateProduct,
} from '../services/product.service.js'
import { importProductsFromCsv } from '../services/productCsvImport.service.js'
import { sendSuccess } from '../utils/response.js'
import { AppError } from '../utils/AppError.js'

const listQuerySchema = z.object({
  localId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  isAlert: z.enum(['true']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

const createBodySchema = z.object({
  localId: z.string().uuid(),
  name: z.string().min(1),
  unit: z.string().optional(),
  barcode: z.union([z.string(), z.null()]).optional(),
  cost: z.number().positive(),
  marginPct: z.number().min(0),
  categoryId: z.union([z.string().uuid(), z.null()]).optional(),
  notes: z.union([z.string(), z.null()]).optional(),
})

const updateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    unit: z.string().optional(),
    barcode: z.union([z.string(), z.null()]).optional(),
    cost: z.number().positive().optional(),
    marginPct: z.number().min(0).optional(),
    categoryId: z.union([z.string().uuid(), z.null()]).optional(),
    notes: z.union([z.string(), z.null()]).optional(),
  })
  .strict()

const bulkBodySchema = z.object({
  localId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  increasePct: z.number(),
})

const importCsvBodySchema = z.object({
  localId: z.string().uuid(),
  csv: z.string().min(1).max(512_000),
})

export async function listProducts(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const q = listQuerySchema.parse(req.query)
  const result = await getProducts(user.id, {
    localId: q.localId,
    categoryId: q.categoryId,
    isAlert: q.isAlert === 'true' ? true : undefined,
    search: q.search,
    page: q.page,
    limit: q.limit,
  })
  sendSuccess(res, result)
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const id = z.string().uuid().parse(req.params.id)
  const product = await getProductById(user.id, id)
  sendSuccess(res, { product })
}

export async function postProduct(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const body = createBodySchema.parse(req.body)
  const product = await createProduct(user, body)
  sendSuccess(res, { product }, 201)
}

export async function putProduct(req: Request, res: Response): Promise<void> {
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
  const product = await updateProduct(user, id, body)
  sendSuccess(res, { product })
}

export async function removeProduct(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const id = z.string().uuid().parse(req.params.id)
  await deleteProduct(user.id, id)
  sendSuccess(res, { ok: true })
}

export async function importCsvProducts(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const body = importCsvBodySchema.parse(req.body)
  const result = await importProductsFromCsv(user, body.localId, body.csv)
  sendSuccess(res, result)
}

export async function bulkUpdate(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const body = bulkBodySchema.parse(req.body)
  const result = await bulkUpdateByPercentage(user.id, body)
  sendSuccess(res, result)
}

export async function productHistory(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const id = z.string().uuid().parse(req.params.id)
  const history = await getProductHistory(user.id, id)
  sendSuccess(res, { history })
}
