import { PlanType } from '@prisma/client'
import type { Request, Response } from 'express'
import { z } from 'zod'

import {
  forceFetchIpcFromAdmin,
  getAdminIndices,
  getAdminStats,
  listUsersForAdmin,
  updateUserPlanForAdmin,
} from '../services/admin.service.js'
import { sendSuccess } from '../utils/response.js'

const listUsersQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
})

const updatePlanBody = z.object({
  plan: z.nativeEnum(PlanType),
  planExpiresAt: z.union([z.string().datetime(), z.null()]).optional(),
})

export async function adminListUsers(req: Request, res: Response): Promise<void> {
  const q = listUsersQuery.parse(req.query)
  const data = await listUsersForAdmin({
    ...(q.page !== undefined ? { page: q.page } : {}),
    ...(q.search !== undefined ? { search: q.search } : {}),
  })
  sendSuccess(res, data)
}

export async function adminUpdateUserPlan(req: Request, res: Response): Promise<void> {
  const id = z.string().uuid().parse(req.params.id)
  const body = updatePlanBody.parse(req.body)
  const user = await updateUserPlanForAdmin({
    userId: id,
    plan: body.plan,
    ...(body.planExpiresAt !== undefined
      ? {
          planExpiresAt: body.planExpiresAt === null ? null : new Date(body.planExpiresAt),
        }
      : {}),
  })
  sendSuccess(res, { user })
}

export async function adminGetStats(_req: Request, res: Response): Promise<void> {
  const stats = await getAdminStats()
  sendSuccess(res, { stats })
}

export async function adminGetIndices(_req: Request, res: Response): Promise<void> {
  const indices = await getAdminIndices(20)
  sendSuccess(res, { indices })
}

export async function adminForceFetchIpc(_req: Request, res: Response): Promise<void> {
  const result = await forceFetchIpcFromAdmin()
  sendSuccess(res, { ipc: result })
}
