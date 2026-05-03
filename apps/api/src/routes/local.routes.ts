import { Router, type IRouter } from 'express'

import {
  applyIpcToLocalHandler,
  createLocalHandler,
  listLocals,
  updateLocalHandler,
} from '../controllers/local.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const localRoutes: IRouter = Router()

localRoutes.get('/', authMiddleware, asyncHandler(listLocals))
localRoutes.post('/', authMiddleware, asyncHandler(createLocalHandler))
localRoutes.put(
  '/:id/apply-ipc',
  authMiddleware,
  asyncHandler(applyIpcToLocalHandler),
)
localRoutes.put('/:id', authMiddleware, asyncHandler(updateLocalHandler))
