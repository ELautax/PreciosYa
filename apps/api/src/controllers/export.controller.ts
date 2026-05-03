import type { Request, Response } from 'express'
import { z } from 'zod'

import { uploadPriceListPng } from '../services/export.service.js'
import { AppError } from '../utils/AppError.js'
import { sendSuccess } from '../utils/response.js'

const bodySchema = z.object({
  localId: z.string().uuid(),
  sharedVia: z.union([z.string(), z.null()]).optional(),
})

export async function createPriceListExport(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }

  const body = bodySchema.parse(req.body)
  const file = req.file
  if (!file) {
    throw new AppError({
      statusCode: 400,
      message: 'Adjuntá un archivo PNG en el campo "file"',
      code: 'FILE_REQUIRED',
    })
  }

  const priceList = await uploadPriceListPng({
    userId: user.id,
    localId: body.localId,
    fileBuffer: file.buffer,
    mimeType: file.mimetype,
    sharedVia: body.sharedVia ?? null,
  })

  sendSuccess(res, { priceList }, 201)
}
