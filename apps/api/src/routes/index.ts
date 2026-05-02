import { Router, type IRouter } from 'express'

import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'

export const routes: IRouter = Router()

routes.get(
  '/health',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    })
  }),
)
