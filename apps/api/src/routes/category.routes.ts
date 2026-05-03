import { Router, type IRouter } from 'express'

import {
  createCategoryHandler,
  deleteCategoryHandler,
  listCategories,
  updateCategoryHandler,
} from '../controllers/category.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const categoryRoutes: IRouter = Router()

categoryRoutes.get('/', authMiddleware, asyncHandler(listCategories))
categoryRoutes.post('/', authMiddleware, asyncHandler(createCategoryHandler))
categoryRoutes.put('/:id', authMiddleware, asyncHandler(updateCategoryHandler))
categoryRoutes.delete('/:id', authMiddleware, asyncHandler(deleteCategoryHandler))
