import type { Request, Response } from 'express'
import { z } from 'zod'

import {
  applyIPCToLocal,
  applyUsdToLocal,
  getIpcBreakdownForLocal,
  getUsdBreakdownForLocal,
} from '../services/economic-index.service.js'
import {
  createLocal,
  getLocalsForUser,
  serializeLocal,
  updateLocal,
} from '../services/local.service.js'
import { sendSuccess } from '../utils/response.js'
import { AppError } from '../utils/AppError.js'

const createLocalSchema = z.object({
  name: z.string().min(1),
  address: z.union([z.string(), z.null()]).optional(),
})

const updateLocalSchema = z
  .object({
    name: z.string().min(1).optional(),
    address: z.union([z.string(), z.null()]).optional(),
    minMarginPct: z.number().min(0).max(99.99).optional(),
    currency: z.string().min(1).max(8).optional(),
  })
  .strict()

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

export async function updateLocalHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const id = z.string().uuid().parse(req.params.id)
  const body = updateLocalSchema.parse(req.body)
  const patch: {
    name?: string
    address?: string | null
    minMarginPct?: number
    currency?: string
  } = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.address !== undefined) patch.address = body.address
  if (body.minMarginPct !== undefined) patch.minMarginPct = body.minMarginPct
  if (body.currency !== undefined) patch.currency = body.currency
  const local = await updateLocal(user.id, id, patch)
  sendSuccess(res, { local: serializeLocal(local) })
}

export async function applyIpcToLocalHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const id = z.string().uuid().parse(req.params.id)
  const result = await applyIPCToLocal(user.id, id)
  sendSuccess(res, result)
}

export async function getIpcBreakdownForLocalHandler(
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
  const result = await getIpcBreakdownForLocal(user.id, id)
  sendSuccess(res, result)
}

export async function applyUsdToLocalHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  const id = z.string().uuid().parse(req.params.id)
  const result = await applyUsdToLocal(user.id, id)
  sendSuccess(res, result)
}

export async function getUsdBreakdownForLocalHandler(
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
  const result = await getUsdBreakdownForLocal(user.id, id)
  sendSuccess(res, result)
}
