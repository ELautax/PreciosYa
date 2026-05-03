import type { RequestHandler } from 'express'

import { isAdminEmail } from '../lib/adminAccess.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const adminMiddleware: RequestHandler = asyncHandler(async (req, _res, next) => {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }
  if (!isAdminEmail(user.email)) {
    throw new AppError({
      statusCode: 403,
      message: 'Acceso solo para administradores',
      code: 'ADMIN_ONLY',
    })
  }
  next()
})
