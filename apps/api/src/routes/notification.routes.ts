import { Router, type IRouter } from 'express'

import {
  listNotifications,
  markOneRead,
  markReadAll,
  unreadCount,
} from '../controllers/notification.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const notificationRoutes: IRouter = Router()

notificationRoutes.get('/', authMiddleware, asyncHandler(listNotifications))
notificationRoutes.get('/unread-count', authMiddleware, asyncHandler(unreadCount))
notificationRoutes.put('/:id/read', authMiddleware, asyncHandler(markOneRead))
notificationRoutes.put('/read-all', authMiddleware, asyncHandler(markReadAll))
