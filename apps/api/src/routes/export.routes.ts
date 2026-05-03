import { Router, type IRouter } from 'express'
import multer from 'multer'

import { createPriceListExport } from '../controllers/export.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

export const exportRoutes: IRouter = Router()

exportRoutes.post(
  '/price-list',
  authMiddleware,
  upload.single('file'),
  asyncHandler(createPriceListExport),
)
