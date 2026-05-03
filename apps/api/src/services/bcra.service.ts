import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

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

export async function fetchLatestBcraReserveFromApi(): Promise<{
  period: Date
  value: number
  sourceUrl: string
}> {
  const base = env.BCRA_API_BASE_URL.replace(/\/$/, '')
  const url = `${base}/estadisticas/v3.0/monetarias/reservas`

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
  const parsed = parseBcraReservesResponse(json)
  const sourceUrl = url.length > 2048 ? url.slice(0, 2048) : url

  return { ...parsed, sourceUrl }
}
