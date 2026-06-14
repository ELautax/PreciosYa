import { Router, type IRouter } from 'express'

import { getWebhook, postWebhook } from '../controllers/subscription.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/** Webhook público de Mercado Pago (sin JWT). */
export const webhookRoutes: IRouter = Router()

webhookRoutes.get('/mercadopago', asyncHandler(getWebhook))
webhookRoutes.post('/mercadopago', asyncHandler(postWebhook))
