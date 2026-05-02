import type { RequestHandler } from 'express'

import { syncUserFromSupabase } from '../services/auth.service.js'
import { verifyToken } from '../lib/supabase.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authMiddleware: RequestHandler = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError({
      statusCode: 401,
      message: 'Token requerido',
      code: 'UNAUTHORIZED',
    })
  }
  const token = authHeader.slice('Bearer '.length).trim()
  const authUser = await verifyToken(token)
  const { user } = await syncUserFromSupabase(authUser)
  req.user = user
  next()
})
