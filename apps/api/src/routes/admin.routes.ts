import { Router, type IRouter } from 'express'

import {
  adminForceFetchIpc,
  adminGetIndices,
  adminGetStats,
  adminListUsers,
  adminUpdateUserPlan,
} from '../controllers/admin.controller.js'
import { adminMiddleware } from '../middlewares/admin.middleware.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const adminRoutes: IRouter = Router()

adminRoutes.get('/users', authMiddleware, adminMiddleware, asyncHandler(adminListUsers))
adminRoutes.put(
  '/users/:id/plan',
  authMiddleware,
  adminMiddleware,
  asyncHandler(adminUpdateUserPlan),
)
adminRoutes.get('/stats', authMiddleware, adminMiddleware, asyncHandler(adminGetStats))
adminRoutes.get('/indices', authMiddleware, adminMiddleware, asyncHandler(adminGetIndices))
adminRoutes.post(
  '/ipc/force-fetch',
  authMiddleware,
  adminMiddleware,
  asyncHandler(adminForceFetchIpc),
)
