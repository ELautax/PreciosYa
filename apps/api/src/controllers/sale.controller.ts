import type { Request, Response } from 'express'
import type { SalesPeriod } from 'shared'
import { z } from 'zod'

import {
  assertPeriodAllowed,
  getCategoryPerformance,
  getPromoteProducts,
  getSalesDashboard,
  getStagnantProducts,
  getStarProducts,
  getTopProducts,
} from '../services/sale-analytics.service.js'
import {
  createSale,
  getSaleById,
  listSales,
} from '../services/sale.service.js'
import { AppError } from '../utils/AppError.js'
import { sendSuccess } from '../utils/response.js'

const periodSchema = z.enum(['today', '7d', '30d', '90d', 'month', 'custom'])

const localIdQuery = z.object({
  localId: z.string().uuid(),
})

const periodQuerySchema = localIdQuery.extend({
  period: periodSchema.default('7d'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})

const listQuerySchema = localIdQuery.extend({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

const createBodySchema = z.object({
  localId: z.string().uuid(),
  soldAt: z.coerce.date().optional(),
  note: z.union([z.string().max(500), z.null()]).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
      }),
    )
    .min(1)
    .max(100),
})

function requireUser(req: Request) {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  return user
}

function parsePeriodQuery(req: Request) {
  const parsed = periodQuerySchema.parse(req.query)
  assertPeriodAllowed(requireUser(req).plan, parsed.period as SalesPeriod)
  return parsed
}

export async function postSale(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const body = createBodySchema.parse(req.body)
  const sale = await createSale(user.id, {
    localId: body.localId,
    items: body.items,
    ...(body.soldAt !== undefined ? { soldAt: body.soldAt } : {}),
    ...(body.note !== undefined ? { note: body.note } : {}),
  })
  sendSuccess(res, { sale }, 201)
}

export async function getSales(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const query = listQuerySchema.parse(req.query)
  const result = await listSales(user.id, user.plan, {
    localId: query.localId,
    page: query.page,
    limit: query.limit,
    ...(query.from !== undefined ? { from: query.from } : {}),
    ...(query.to !== undefined ? { to: query.to } : {}),
  })
  sendSuccess(res, result)
}

export async function getSale(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const id = z.string().uuid().parse(req.params.id)
  const sale = await getSaleById(user.id, user.plan, id)
  sendSuccess(res, { sale })
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const q = parsePeriodQuery(req)
  const data = await getSalesDashboard(
    user.id,
    user.plan,
    q.localId,
    q.period as SalesPeriod,
    q.from,
    q.to,
  )
  sendSuccess(res, data)
}

export async function getTopProductsHandler(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const q = parsePeriodQuery(req)
  const data = await getTopProducts(
    user.id,
    q.localId,
    q.period as SalesPeriod,
    q.from,
    q.to,
  )
  sendSuccess(res, data)
}

export async function getStagnantProductsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req)
  const q = localIdQuery.parse(req.query)
  const days = z.coerce.number().int().positive().max(365).optional().parse(req.query.days)
  const data = await getStagnantProducts(user.id, q.localId, days)
  sendSuccess(res, data)
}

export async function getPromoteProductsHandler(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const q = parsePeriodQuery(req)
  const data = await getPromoteProducts(
    user.id,
    q.localId,
    q.period as SalesPeriod,
    q.from,
    q.to,
  )
  sendSuccess(res, data)
}

export async function getStarProductsHandler(req: Request, res: Response): Promise<void> {
  const user = requireUser(req)
  const q = parsePeriodQuery(req)
  const data = await getStarProducts(
    user.id,
    q.localId,
    q.period as SalesPeriod,
    q.from,
    q.to,
  )
  sendSuccess(res, data)
}

export async function getCategoryPerformanceHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const user = requireUser(req)
  const q = parsePeriodQuery(req)
  const data = await getCategoryPerformance(
    user.id,
    q.localId,
    q.period as SalesPeriod,
    q.from,
    q.to,
  )
  sendSuccess(res, data)
}
