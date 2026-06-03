import { Router, type IRouter } from 'express'

import {
  applyIpcToLocalHandler,
  applyUsdToLocalHandler,
  createLocalHandler,
  getIpcBreakdownForLocalHandler,
  getUsdBreakdownForLocalHandler,
  listLocals,
  updateLocalHandler,
} from '../controllers/local.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const localRoutes: IRouter = Router()

localRoutes.get('/', authMiddleware, asyncHandler(listLocals))
localRoutes.post('/', authMiddleware, asyncHandler(createLocalHandler))
localRoutes.get(
  '/:id/ipc-breakdown',
  authMiddleware,
  asyncHandler(getIpcBreakdownForLocalHandler),
)
localRoutes.put(
  '/:id/apply-ipc',
  authMiddleware,
  asyncHandler(applyIpcToLocalHandler),
)
localRoutes.get(
  '/:id/usd-breakdown',
  authMiddleware,
  asyncHandler(getUsdBreakdownForLocalHandler),
)
localRoutes.put(
  '/:id/apply-usd',
  authMiddleware,
  asyncHandler(applyUsdToLocalHandler),
)
localRoutes.put('/:id', authMiddleware, asyncHandler(updateLocalHandler))
