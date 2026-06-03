import type { Request, Response } from 'express'

import {
  ensureFreshBcraInSnapshot,
  getIpcHistory,
  serializeEconomicIndex,
} from '../services/economic-index.service.js'
import { sendSuccess } from '../utils/response.js'
import { AppError } from '../utils/AppError.js'

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
