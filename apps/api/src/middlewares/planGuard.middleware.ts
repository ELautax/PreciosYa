import type { PlanType } from '@prisma/client'
import type { RequestHandler } from 'express'

import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const rank: Record<PlanType, number> = {
  FREE: 0,
  PRO: 1,
  AGENCY: 2,
}

/** Exige un plan mínimo (orden FREE, PRO, AGENCY). */
export function requirePlan(minPlan: PlanType): RequestHandler {
  return asyncHandler(async (req, _res, next) => {
    const user = req.user
    if (!user) {
      throw new AppError({
        statusCode: 401,
        message: 'No autenticado',
        code: 'UNAUTHORIZED',
      })
    }
    if (rank[user.plan] < rank[minPlan]) {
      throw new AppError({
        statusCode: 403,
        message: 'Tu plan no permite esta acción',
        code: 'PLAN_REQUIRED',
      })
    }
    next()
  })
}
