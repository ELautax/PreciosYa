import { Router, type IRouter } from 'express'

import { postWebhook } from '../controllers/subscription.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/** Webhook público de Mercado Pago (sin JWT). */
export const webhookRoutes: IRouter = Router()

webhookRoutes.post('/mercadopago', asyncHandler(postWebhook))
