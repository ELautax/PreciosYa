import { Router, type IRouter } from 'express'

import {
  bulkUpdate,
  importCsvProducts,
  getProduct,
  listProducts,
  postProduct,
  productHistory,
  putProduct,
  removeProduct,
} from '../controllers/product.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const productRoutes: IRouter = Router()

productRoutes.get('/', authMiddleware, asyncHandler(listProducts))
productRoutes.post('/import-csv', authMiddleware, asyncHandler(importCsvProducts))
productRoutes.post('/', authMiddleware, asyncHandler(postProduct))
productRoutes.put('/bulk-update', authMiddleware, asyncHandler(bulkUpdate))
productRoutes.get('/:id/history', authMiddleware, asyncHandler(productHistory))
productRoutes.get('/:id', authMiddleware, asyncHandler(getProduct))
productRoutes.put('/:id', authMiddleware, asyncHandler(putProduct))
productRoutes.delete('/:id', authMiddleware, asyncHandler(removeProduct))
