import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

export const BCRA_USD_RATE_SOURCE_SUFFIX = '|usdRate='

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function parseBcraError(): AppError {
  return new AppError({
    statusCode: 502,
    message: 'Respuesta BCRA inválida',
    code: 'BCRA_PARSE_ERROR',
  })
}

function extractUsdRateFromDetalle(detalle: unknown): number | null {
  if (!Array.isArray(detalle)) return null
  for (const item of detalle) {
    if (typeof item !== 'object' || item === null) continue
    const row = item as Record<string, unknown>
    if (row.codigoMoneda !== 'USD') continue
    const rate = Number(row.tipoCotizacion)
    if (Number.isFinite(rate) && rate > 0) return rate
  }
  return null
}

export function parseBcraUsdCotizacionesResponse(json: unknown): Array<{
  period: Date
  usdRate: number
}> {
  if (typeof json !== 'object' || json === null) {
    throw parseBcraError()
  }
  const root = json as Record<string, unknown>
  const results = root.results
  if (!Array.isArray(results) || results.length === 0) {
    throw parseBcraError()
  }

  const rows: Array<{ period: Date; usdRate: number }> = []
  for (const entry of results) {
    if (typeof entry !== 'object' || entry === null) continue
    const row = entry as Record<string, unknown>
    const parsedDate = new Date(String(row.fecha))
    if (Number.isNaN(parsedDate.getTime())) continue
    const usdRate = extractUsdRateFromDetalle(row.detalle)
    if (usdRate === null) continue
    rows.push({ period: startOfUtcDay(parsedDate), usdRate })
  }

  if (rows.length === 0) {
    throw parseBcraError()
  }

  rows.sort((a, b) => a.period.getTime() - b.period.getTime())
  return rows
}

export function computeUsdDailyVariationPct(
  latestRate: number,
  previousRate: number,
): number {
  if (previousRate <= 0) return 0
  const pct = ((latestRate - previousRate) / previousRate) * 100
  return Math.round(pct * 1000) / 1000
}

export function encodeBcraSourceUrl(baseUrl: string, usdRate: number): string {
  const suffix = `${BCRA_USD_RATE_SOURCE_SUFFIX}${usdRate}`
  const maxBase = 2048 - suffix.length
  const trimmedBase = baseUrl.length > maxBase ? baseUrl.slice(0, maxBase) : baseUrl
  return `${trimmedBase}${suffix}`
}

export function parseUsdRateFromSourceUrl(sourceUrl: string | null | undefined): number | null {
  if (!sourceUrl) return null
  const idx = sourceUrl.indexOf(BCRA_USD_RATE_SOURCE_SUFFIX)
  if (idx < 0) return null
  const raw = sourceUrl.slice(idx + BCRA_USD_RATE_SOURCE_SUFFIX.length)
  const rate = Number(raw)
  return Number.isFinite(rate) && rate > 0 ? rate : null
}

function formatDateParam(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function fetchLatestBcraUsdOficialFromApi(): Promise<{
  period: Date
  usdRate: number
  variationPct: number
  sourceUrl: string
}> {
  const base = env.BCRA_API_BASE_URL.replace(/\/$/, '')
  const hasta = new Date()
  const desde = new Date(hasta)
  desde.setUTCDate(desde.getUTCDate() - 14)
  const url =
    `${base}/estadisticascambiarias/v1.0/Cotizaciones/USD` +
    `?fechaDesde=${formatDateParam(desde)}&fechaHasta=${formatDateParam(hasta)}&limit=10`

  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  } catch {
    throw new AppError({
      statusCode: 502,
      message: 'No se pudo contactar el servicio BCRA',
      code: 'BCRA_UNAVAILABLE',
    })
  }

  if (!res.ok) {
    throw new AppError({
      statusCode: 502,
      message: `BCRA respondió ${res.status}`,
      code: 'BCRA_BAD_RESPONSE',
    })
  }

  const json: unknown = await res.json()
  const rows = parseBcraUsdCotizacionesResponse(json)
  const latest = rows[rows.length - 1]
  if (!latest) {
    throw parseBcraError()
  }
  const previous = rows.length >= 2 ? rows[rows.length - 2] : null
  const variationPct = previous
    ? computeUsdDailyVariationPct(latest.usdRate, previous.usdRate)
    : 0

  return {
    period: latest.period,
    usdRate: latest.usdRate,
    variationPct,
    sourceUrl: encodeBcraSourceUrl(url, latest.usdRate),
  }
}

/** @deprecated Usar fetchLatestBcraUsdOficialFromApi — conservado para tests legacy de reservas. */
export function parseBcraReservesResponse(json: unknown): {
  period: Date
  value: number
} {
  if (typeof json !== 'object' || json === null) {
    throw parseBcraError()
  }

  const root = json as Record<string, unknown>
  const candidatos: unknown[] = []

  if (Array.isArray(root.results)) {
    candidatos.push(...root.results)
  }
  if (Array.isArray(root.data)) {
    candidatos.push(...root.data)
  }

  const last = candidatos[candidatos.length - 1]
  if (typeof last !== 'object' || last === null) {
    throw parseBcraError()
  }

  const row = last as Record<string, unknown>
  const rawDate = row.fecha ?? row.date
  const parsedDate = new Date(String(rawDate))
  if (Number.isNaN(parsedDate.getTime())) {
    throw parseBcraError()
  }

  const rawValue = row.valor ?? row.value ?? row.v
  const value = Number(typeof rawValue === 'string' ? rawValue.replace(',', '.') : rawValue)
  if (!Number.isFinite(value)) {
    throw parseBcraError()
  }

  return {
    period: startOfUtcDay(parsedDate),
    value,
  }
}
