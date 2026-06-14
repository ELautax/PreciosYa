import { Router, type IRouter } from 'express'

import {
  getStatus,
  postCheckout,
  postSync,
  postWebhook,
} from '../controllers/subscription.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const subscriptionRoutes: IRouter = Router()

subscriptionRoutes.get('/status', authMiddleware, asyncHandler(getStatus))
subscriptionRoutes.post('/checkout', authMiddleware, asyncHandler(postCheckout))
subscriptionRoutes.post('/sync', authMiddleware, asyncHandler(postSync))
subscriptionRoutes.post('/webhook', asyncHandler(postWebhook))
