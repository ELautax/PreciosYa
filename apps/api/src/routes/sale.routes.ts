import { Router, type IRouter } from 'express'

import {
  getCategoryPerformanceHandler,
  getDashboard,
  getPromoteProductsHandler,
  getSale,
  getSales,
  getStagnantProductsHandler,
  getStarProductsHandler,
  getTopProductsHandler,
  postSale,
} from '../controllers/sale.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { requirePlan } from '../middlewares/planGuard.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const saleRoutes: IRouter = Router()

saleRoutes.post('/', authMiddleware, asyncHandler(postSale))
saleRoutes.get('/dashboard', authMiddleware, asyncHandler(getDashboard))
saleRoutes.get(
  '/top-products',
  authMiddleware,
  requirePlan('PRO'),
  asyncHandler(getTopProductsHandler),
)
saleRoutes.get(
  '/stagnant-products',
  authMiddleware,
  requirePlan('PRO'),
  asyncHandler(getStagnantProductsHandler),
)
saleRoutes.get(
  '/promote-products',
  authMiddleware,
  requirePlan('PRO'),
  asyncHandler(getPromoteProductsHandler),
)
saleRoutes.get(
  '/star-products',
  authMiddleware,
  requirePlan('PRO'),
  asyncHandler(getStarProductsHandler),
)
saleRoutes.get(
  '/category-performance',
  authMiddleware,
  requirePlan('PRO'),
  asyncHandler(getCategoryPerformanceHandler),
)
saleRoutes.get('/', authMiddleware, asyncHandler(getSales))
saleRoutes.get('/:id', authMiddleware, asyncHandler(getSale))
