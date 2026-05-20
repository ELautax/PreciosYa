import { IndexType } from '@prisma/client'

import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

/** Serie IPC nivel general mensual (INDEC vía datos.gob.ar). */
const IPC_SERIES_ID = '148.3_INIVELNAL_DICI_M_26'
/** Serie IPC alimentos (puede variar según catálogo de datos.gob.ar). */
const IPC_ALIMENTOS_SERIES_ID = '148.3_INIVELNAL_DICI_M_34'

/** Variación % mensual respecto al mes anterior (no el nivel del índice). */
const PERCENT_CHANGE_SUFFIX = ':percent_change'

function startOfUtcMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

function parseError(): AppError {
  return new AppError({
    statusCode: 502,
    message: 'Respuesta INDEC inválida',
    code: 'INDEC_PARSE_ERROR',
  })
}

/**
 * Interpreta el JSON del endpoint series de datos.gob.ar (varias variantes).
 */
export function parseIndecSeriesResponse(json: unknown): {
  period: Date
  valuePct: number
} {
  if (typeof json !== 'object' || json === null) {
    throw parseError()
  }
  const root = json as Record<string, unknown>

  const tryTupleRow = (row: unknown): { period: Date; valuePct: number } | null => {
    if (!Array.isArray(row) || row.length < 2) return null
    const d = new Date(String(row[0]))
    if (Number.isNaN(d.getTime())) return null
    const v = Number(row[1])
    if (!Number.isFinite(v)) return null
    return { period: startOfUtcMonth(d), valuePct: v }
  }

  const dataArr = root.data
  if (Array.isArray(dataArr) && dataArr.length > 0) {
    // datos.gob.ar: { data: [["2026-02-01", 0.029], ...] }
    if (Array.isArray(dataArr[0])) {
      const last = dataArr[dataArr.length - 1]
      const tuple = tryTupleRow(last)
      if (tuple) return tuple
    }

    const block = dataArr[0] as Record<string, unknown>
    const series = block.series
    if (Array.isArray(series) && series.length > 0) {
      const last = series[series.length - 1]
      if (typeof last === 'object' && last !== null && 'fecha' in last) {
        const o = last as { fecha: unknown; valor?: unknown }
        const d = new Date(String(o.fecha))
        if (Number.isNaN(d.getTime())) throw parseError()
        const rawVal = o.valor
        const v = Number(
          typeof rawVal === 'string' ? rawVal.replace(',', '.') : rawVal,
        )
        if (!Number.isFinite(v)) throw parseError()
        return { period: startOfUtcMonth(d), valuePct: v }
      }
      const tuple = tryTupleRow(last)
      if (tuple) return tuple
    }
  }

  const results = root.results
  if (Array.isArray(results) && results.length > 0) {
    const last = results[results.length - 1]
    const tuple = tryTupleRow(last)
    if (tuple) return tuple
  }

  throw parseError()
}

/**
 * Con `:percent_change`, datos.gob.ar devuelve fracción (0.0289 = 2,89 %).
 * Valores ya en puntos porcentuales (p. ej. 4.1) no se escalan.
 */
export function normalizeIndecPercentValue(raw: number): number {
  if (!Number.isFinite(raw)) throw parseError()
  if (Math.abs(raw) < 1.5) {
    return Math.round(raw * 100 * 1000) / 1000
  }
  return Math.round(raw * 1000) / 1000
}

function getSeriesIdForIndexType(indexType: IndexType): string {
  switch (indexType) {
    case IndexType.IPC_INDEC:
      return IPC_SERIES_ID
    case IndexType.IPC_INDEC_ALIMENTOS:
      return IPC_ALIMENTOS_SERIES_ID
    default:
      return IPC_SERIES_ID
  }
}

export async function fetchLatestIPCFromApi(
  indexType: IndexType = IndexType.IPC_INDEC,
): Promise<{
  period: Date
  valuePct: number
  sourceUrl: string
}> {
  const base = env.INDEC_API_BASE_URL.replace(/\/$/, '')
  const seriesId = getSeriesIdForIndexType(indexType)
  const url = `${base}/series/?ids=${seriesId}${PERCENT_CHANGE_SUFFIX}&last=1&format=json`

  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
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
      message: `INDEC respondió ${res.status}`,
      code: 'INDEC_BAD_RESPONSE',
    })
  }

  const json: unknown = await res.json()
  const parsed = parseIndecSeriesResponse(json)
  const valuePct = normalizeIndecPercentValue(parsed.valuePct)
  const sourceUrl = url.length > 2048 ? url.slice(0, 2048) : url
  return { period: parsed.period, valuePct, sourceUrl }
}
