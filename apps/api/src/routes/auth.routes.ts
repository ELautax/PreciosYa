import { Router, type IRouter } from 'express'

import { googleLogin, logout, me, refresh } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authRoutes: IRouter = Router()

authRoutes.post('/google', asyncHandler(googleLogin))
authRoutes.post('/refresh', asyncHandler(refresh))
authRoutes.post('/logout', authMiddleware, asyncHandler(logout))
authRoutes.get('/me', authMiddleware, asyncHandler(me))
