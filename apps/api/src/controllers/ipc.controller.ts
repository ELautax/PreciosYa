import type { Request, Response } from 'express'

import {
  fetchPersistAndReturnLatestBcraUsdOficial,
  fetchPersistAndReturnLatestIpc,
  getIpcHistory,
  getLatestIndicesSnapshot,
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

  let snapshot = await getLatestIndicesSnapshot()
  if (!snapshot.ipc) {
    try {
      await fetchPersistAndReturnLatestIpc()
      snapshot = await getLatestIndicesSnapshot()
    } catch {
      // Se devuelve null si el INDEC no está disponible.
    }
  }
  if (!snapshot.bcra) {
    try {
      await fetchPersistAndReturnLatestBcraUsdOficial()
      snapshot = await getLatestIndicesSnapshot()
    } catch {
      // Sin BCRA en red: se devuelve null.
    }
  }

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
