import { Router, type IRouter } from 'express'

import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { authRoutes } from './auth.routes.js'

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
api.use('/auth', authRoutes)

export const routes: IRouter = root
export const apiRoutes: IRouter = api
