import { IndexType } from '@prisma/client'

import { env } from '../../config/env.js'
import {
  normalizeIndecPercentValue,
  parseIndecSeriesResponse,
} from '../indec.service.js'
import { upsertIpcIndec } from '../economic-index.service.js'
import { AppError } from '../../utils/AppError.js'
import { fetchGeneralIpcFromArgly } from './argly.service.js'
import { fetchLatestIpcFromAlphacast } from './alphacast.service.js'
import type { FetchedIpcRow } from './ipc-fetch.types.js'
import { IPC_SERIES_CONFIG, getSeriesIdForIndexType } from './ipc-series.config.js'

export type { FetchedIpcRow } from './ipc-fetch.types.js'

const PERCENT_CHANGE_SUFFIX = ':percent_change'

async function fetchSeriesById(seriesId: string): Promise<{
  period: Date
  valuePct: number
  sourceUrl: string
}> {
  const base = env.INDEC_API_BASE_URL.replace(/\/$/, '')
  const url = `${base}/series/?ids=${seriesId}${PERCENT_CHANGE_SUFFIX}&last=1&format=json`

  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(25_000) })
  } catch {
    throw new AppError({
      statusCode: 502,
      message: 'No se pudo contactar el servicio INDEC',
      code: 'INDEC_UNAVAILABLE',
    })
  }

  if (!res.ok) {
    throw new AppError({
      statusCode: 502,
      message: `INDEC respondió ${res.status} para ${seriesId}`,
      code: 'INDEC_BAD_RESPONSE',
    })
  }

  const json: unknown = await res.json()
  const parsed = parseIndecSeriesResponse(json)
  const valuePct = normalizeIndecPercentValue(parsed.valuePct)
  const sourceUrl = url.length > 2048 ? url.slice(0, 2048) : url
  return { period: parsed.period, valuePct, sourceUrl }
}

export async function fetchLatestIpcForType(
  indexType: IndexType,
): Promise<FetchedIpcRow> {
  const seriesId = getSeriesIdForIndexType(indexType)
  try {
    const row = await fetchSeriesById(seriesId)
    return { indexType, ...row }
  } catch (err) {
    if (indexType === IndexType.IPC_INDEC) throw err
    const fallbackId = getSeriesIdForIndexType(IndexType.IPC_INDEC)
    const row = await fetchSeriesById(fallbackId)
    console.warn(
      `[ipc-fetch] fallback IPC general para ${indexType} (serie ${seriesId} falló)`,
    )
    return { indexType, ...row }
  }
}

async function fetchAndPersistFromDatosGob(): Promise<{
  results: FetchedIpcRow[]
  general: FetchedIpcRow | null
}> {
  const results: FetchedIpcRow[] = []
  let general: FetchedIpcRow | null = null

  for (const cfg of IPC_SERIES_CONFIG) {
    try {
      const row = await fetchLatestIpcForType(cfg.indexType)
      await upsertIpcIndec({
        type: cfg.indexType,
        period: row.period,
        valuePct: row.valuePct,
        sourceUrl: row.sourceUrl,
      })
      results.push(row)
      if (cfg.indexType === IndexType.IPC_INDEC) general = row
    } catch (e) {
      console.error(`[ipc-fetch] error en ${cfg.indexType}`, e)
    }
  }

  return { results, general }
}

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

export async function fetchAndPersistAllIpcSeries(): Promise<{
  results: FetchedIpcRow[]
  general: FetchedIpcRow | null
}> {
  if (env.ALPHACAST_API_KEY) {
    try {
      const fromAlphacast = await fetchAndPersistFromAlphacast()
      if (fromAlphacast.results.length > 0) {
        console.info(
          `[ipc-fetch] IPC desde Alphacast (${fromAlphacast.results.length} series, mes ${fromAlphacast.general?.period.toISOString().slice(0, 7) ?? '?'})`,
        )
        return fromAlphacast
      }
    } catch (e) {
      console.error('[ipc-fetch] Alphacast falló; probando Argly (IPC general)', e)
    }
  } else {
    console.warn(
      '[ipc-fetch] ALPHACAST_API_KEY no configurada; probando Argly o datos.gob.ar',
    )
  }

  const fromDatosGob = await fetchAndPersistFromDatosGob()

  try {
    const general = await fetchGeneralIpcFromArgly()
    await upsertIpcIndec({
      type: general.indexType,
      period: general.period,
      valuePct: general.valuePct,
      sourceUrl: general.sourceUrl,
    })
    const results = fromDatosGob.results.map((r) =>
      r.indexType === IndexType.IPC_INDEC ? general : r,
    )
    console.info(
      `[ipc-fetch] IPC general actualizado desde Argly (${general.valuePct}%, ${general.period.toISOString().slice(0, 7)})`,
    )
    return { results, general }
  } catch (arglyErr) {
    console.error('[ipc-fetch] Argly falló; quedan datos de datos.gob.ar', arglyErr)
    return fromDatosGob
  }
}
