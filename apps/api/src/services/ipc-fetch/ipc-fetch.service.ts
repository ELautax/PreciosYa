import { IndexType } from '@prisma/client'

import { env } from '../../config/env.js'
import { AppError } from '../../utils/AppError.js'
import { upsertIpcIndec } from '../economic-index.service.js'
import { fetchGeneralIpcFromArgly } from './argly.service.js'
import { fetchLatestIpcFromAlphacast } from './alphacast.service.js'
import { ALPHACAST_MOM_COLUMN_BY_INDEX } from './alphacast.config.js'
import type { FetchedIpcRow } from './ipc-fetch.types.js'

export type { FetchedIpcRow } from './ipc-fetch.types.js'

async function fetchAndPersistFromAlphacast(): Promise<{
  results: FetchedIpcRow[]
  general: FetchedIpcRow | null
}> {
  const rows = await fetchLatestIpcFromAlphacast()
  const results: FetchedIpcRow[] = []
  let general: FetchedIpcRow | null = null

  for (const row of rows) {
    await upsertIpcIndec({
      type: row.indexType,
      period: row.period,
      valuePct: row.valuePct,
      sourceUrl: row.sourceUrl,
    })
    results.push(row)
    if (row.indexType === IndexType.IPC_INDEC) general = row
  }

  return { results, general }
}

/** Argly solo trae IPC general: replica el mismo % en todas las divisiones COICOP. */
async function fetchAndPersistFromArglyFallback(): Promise<{
  results: FetchedIpcRow[]
  general: FetchedIpcRow
}> {
  const general = await fetchGeneralIpcFromArgly()
  const results: FetchedIpcRow[] = []

  for (const { indexType } of ALPHACAST_MOM_COLUMN_BY_INDEX) {
    const row: FetchedIpcRow = {
      indexType,
      period: general.period,
      valuePct: general.valuePct,
      sourceUrl: `${general.sourceUrl} (respaldo general Argly)`,
    }
    await upsertIpcIndec({
      type: row.indexType,
      period: row.period,
      valuePct: row.valuePct,
      sourceUrl: row.sourceUrl,
    })
    results.push(row)
  }

  console.warn(
    `[ipc-fetch] Alphacast no disponible; IPC general Argly (${general.valuePct}%, ${general.period.toISOString().slice(0, 7)}) aplicado a todas las divisiones`,
  )
  return { results, general }
}

export async function fetchAndPersistAllIpcSeries(): Promise<{
  results: FetchedIpcRow[]
  general: FetchedIpcRow | null
}> {
  const hasAlphacast = Boolean(env.ALPHACAST_API_KEY?.trim() || env.ALPHACAST_DOWNLOAD_URL)

  if (hasAlphacast) {
    try {
      const fromAlphacast = await fetchAndPersistFromAlphacast()
      if (fromAlphacast.results.length > 0) {
        console.info(
          `[ipc-fetch] IPC desde Alphacast (${fromAlphacast.results.length} series, mes ${fromAlphacast.general?.period.toISOString().slice(0, 7) ?? '?'})`,
        )
        return fromAlphacast
      }
    } catch (e) {
      console.error('[ipc-fetch] Alphacast falló; probando Argly (solo IPC general)', e)
    }
  } else {
    console.warn('[ipc-fetch] ALPHACAST_API_KEY no configurada; probando Argly')
  }

  try {
    return await fetchAndPersistFromArglyFallback()
  } catch (arglyErr) {
    console.error('[ipc-fetch] Argly falló', arglyErr)
    throw new AppError({
      statusCode: 502,
      message:
        'No se pudo obtener IPC (Alphacast/Argly). Configurá ALPHACAST_API_KEY en Railway o usá carga manual en Admin.',
      code: 'IPC_FETCH_UNAVAILABLE',
    })
  }
}
