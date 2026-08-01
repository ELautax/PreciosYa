import type { Request, Response } from 'express'

import {
  ensureFreshBcraInSnapshot,
  getIpcHistory,
  getIpcSeriesForPeriod,
  serializeEconomicIndex,
} from '../services/economic-index.service.js'
import { sendSuccess } from '../utils/response.js'
import { AppError } from '../utils/AppError.js'
import { z } from 'zod'

export async function getIpcLatestHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }

  const snapshot = await ensureFreshBcraInSnapshot()

  sendSuccess(res, {
    ipc: snapshot.ipc ? serializeEconomicIndex(snapshot.ipc) : null,
    bcra: snapshot.bcra ? serializeEconomicIndex(snapshot.bcra) : null,
  })
}

export async function getIpcHistoryHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }

  const rows = await getIpcHistory(12)
  sendSuccess(res, {
    indices: rows.map(serializeEconomicIndex),
  })
}

const seriesQuery = z.object({
  period: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
})

export async function getIpcSeriesHandler(req: Request, res: Response): Promise<void> {
  const user = req.user
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: 'No autenticado',
      code: 'UNAUTHORIZED',
    })
  }

  const q = seriesQuery.parse(req.query)
  const data = await getIpcSeriesForPeriod(q.period)
  sendSuccess(res, data)
}
