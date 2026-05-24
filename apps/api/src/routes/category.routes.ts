import { Router, type IRouter } from 'express'

import {
  listCategories,
  listCategoryTemplatesHandler,
  patchCategoryActiveHandler,
} from '../controllers/category.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const categoryRoutes: IRouter = Router()

categoryRoutes.get('/', authMiddleware, asyncHandler(listCategories))
categoryRoutes.get('/templates', authMiddleware, asyncHandler(listCategoryTemplatesHandler))
categoryRoutes.patch('/:id', authMiddleware, asyncHandler(patchCategoryActiveHandler))
