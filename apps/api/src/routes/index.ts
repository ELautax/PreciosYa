import { Router, type IRouter } from 'express'

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

const root = Router()

root.get(
  '/health',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
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

export const routes: IRouter = root
export const apiRoutes: IRouter = api
