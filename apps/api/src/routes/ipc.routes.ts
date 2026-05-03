import { Router, type IRouter } from 'express'

import {
  getIpcHistoryHandler,
  getIpcLatestHandler,
} from '../controllers/ipc.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const ipcRoutes: IRouter = Router()

ipcRoutes.get('/latest', authMiddleware, asyncHandler(getIpcLatestHandler))
ipcRoutes.get('/history', authMiddleware, asyncHandler(getIpcHistoryHandler))
