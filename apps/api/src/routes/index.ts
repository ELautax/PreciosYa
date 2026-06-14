import { Router, type IRouter } from 'express'

import { env } from '../config/env.js'
import { isMpConfigured } from '../services/mercadopago.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { adminRoutes } from './admin.routes.js'
import { authRoutes } from './auth.routes.js'
import { categoryRoutes } from './category.routes.js'
import { exportRoutes } from './export.routes.js'
import { ipcRoutes } from './ipc.routes.js'
import { localRoutes } from './local.routes.js'
import { notificationRoutes } from './notification.routes.js'
import { productRoutes } from './product.routes.js'
import { saleRoutes } from './sale.routes.js'
import { subscriptionRoutes } from './subscription.routes.js'
import { webhookRoutes } from './webhook.routes.js'

const root = Router()

root.get(
  '/',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, {
      name: 'PreciosYa API',
      health: '/health',
      apiBase: '/api',
    })
  }),
)

root.get(
  '/health',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.2.0',
      gitCommit: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      /** Si es true, POST /api/admin/ipc/manual existe (deploy ≥ mayo 2026). */
      ipcManualRoute: true,
      ipcSource: 'alphacast',
      mpConfigured: isMpConfigured(),
      mpProAmountArs: env.MP_PRO_AMOUNT_ARS,
    })
  }),
)

const api = Router()
api.use('/admin', adminRoutes)
api.use('/auth', authRoutes)
api.use('/locals', localRoutes)
api.use('/categories', categoryRoutes)
api.use('/exports', exportRoutes)
api.use('/ipc', ipcRoutes)
api.use('/notifications', notificationRoutes)
api.use('/products', productRoutes)
api.use('/sales', saleRoutes)
api.use('/subscriptions', subscriptionRoutes)
api.use('/webhooks', webhookRoutes)

export const routes: IRouter = root
export const apiRoutes: IRouter = api
