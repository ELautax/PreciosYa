import { IndexType } from '@prisma/client'

import { env } from '../../config/env.js'
import { AppError } from '../../utils/AppError.js'
import {
  ALPHACAST_MOM_COLUMN_BY_INDEX,
  ALPHACAST_MOM_SUFFIX,
} from './alphacast.config.js'
import type { FetchedIpcRow } from './ipc-fetch.types.js'

function startOfUtcMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

/** Parsea una línea CSV con campos entre comillas opcionales. */
export function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out
}

function roundPct(n: number): number {
  return Math.round(n * 1000) / 1000
}

export function buildAlphacastIpcDownloadUrl(): string {
  const base = env.ALPHACAST_API_BASE_URL.replace(/\/$/, '')
  const key = encodeURIComponent(env.ALPHACAST_API_KEY ?? '')
  return `${base}/datasets/${env.ALPHACAST_IPC_DATASET_ID}/data?apiKey=${key}&format=csv`
}

export function parseAlphacastIpcCsv(csvText: string): FetchedIpcRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length < 2) {
    throw new AppError({
      statusCode: 502,
      message: 'CSV de Alphacast vacío o inválido',
      code: 'ALPHACAST_PARSE_ERROR',
    })
  }

  const headerLine = lines[0]
  if (!headerLine) {
    throw new AppError({
      statusCode: 502,
      message: 'CSV de Alphacast sin encabezado',
      code: 'ALPHACAST_PARSE_ERROR',
    })
  }
  const header = parseCsvLine(headerLine)
  const dateIdx = header.findIndex((h) => h.trim().toLowerCase() === 'date')
  if (dateIdx < 0) {
    throw new AppError({
      statusCode: 502,
      message: 'CSV de Alphacast sin columna Date',
      code: 'ALPHACAST_PARSE_ERROR',
    })
  }

  const columnIndexByType = new Map<IndexType, number>()
  for (const { indexType, columnBase } of ALPHACAST_MOM_COLUMN_BY_INDEX) {
    const target = `${columnBase}${ALPHACAST_MOM_SUFFIX}`
    const idx = header.findIndex((h) => h.trim() === target)
    if (idx < 0) {
      throw new AppError({
        statusCode: 502,
        message: `CSV de Alphacast sin columna ${target}`,
        code: 'ALPHACAST_PARSE_ERROR',
      })
    }
    columnIndexByType.set(indexType, idx)
  }

  let latestCells: string[] | null = null
  let latestPeriod: Date | null = null

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const cells = parseCsvLine(line)
    const rawDate = cells[dateIdx]?.trim()
    if (!rawDate) continue
    const period = startOfUtcMonth(new Date(rawDate))
    if (Number.isNaN(period.getTime())) continue
    if (!latestPeriod || period.getTime() > latestPeriod.getTime()) {
      latestPeriod = period
      latestCells = cells
    }
  }

  if (!latestPeriod || !latestCells) {
    throw new AppError({
      statusCode: 502,
      message: 'No hay filas de IPC en el CSV de Alphacast',
      code: 'ALPHACAST_PARSE_ERROR',
    })
  }

  const sourceUrl = `https://api.alphacast.io/datasets/${env.ALPHACAST_IPC_DATASET_ID}/data`
  const rows: FetchedIpcRow[] = []

  for (const { indexType } of ALPHACAST_MOM_COLUMN_BY_INDEX) {
    const colIdx = columnIndexByType.get(indexType)
    if (colIdx === undefined) continue
    const raw = Number(latestCells[colIdx]?.trim().replace(',', '.'))
    if (!Number.isFinite(raw)) {
      throw new AppError({
        statusCode: 502,
        message: `Valor IPC inválido para ${indexType}`,
        code: 'ALPHACAST_PARSE_ERROR',
      })
    }
    rows.push({
      indexType,
      period: latestPeriod,
      valuePct: roundPct(raw),
      sourceUrl,
    })
  }

  return rows
}

function basicAuthHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`${apiKey}:`, 'utf8').toString('base64')}`
}

async function downloadAlphacastCsv(): Promise<string> {
  const key = env.ALPHACAST_API_KEY?.trim()
  if (!key && !env.ALPHACAST_DOWNLOAD_URL) {
    throw new AppError({
      statusCode: 503,
      message: 'ALPHACAST_API_KEY no configurada',
      code: 'ALPHACAST_NOT_CONFIGURED',
    })
  }

  const base = env.ALPHACAST_API_BASE_URL.replace(/\/$/, '')
  const id = env.ALPHACAST_IPC_DATASET_ID
  const attempts: { url: string; headers?: HeadersInit }[] = []

  if (env.ALPHACAST_DOWNLOAD_URL) {
    attempts.push({ url: env.ALPHACAST_DOWNLOAD_URL })
  }
  if (key) {
    attempts.push({ url: buildAlphacastIpcDownloadUrl() })
    attempts.push({
      url: `${base}/datasets/${id}/data?format=csv`,
      headers: { Authorization: basicAuthHeader(key) },
    })
    attempts.push({
      url: `https://charts.alphacast.io/api/datasets/${id}.csv`,
      headers: { Authorization: basicAuthHeader(key) },
    })
  }

  let lastStatus = 0
  for (const attempt of attempts) {
    try {
      const init: RequestInit = { signal: AbortSignal.timeout(60_000) }
      if (attempt.headers) init.headers = attempt.headers
      const res = await fetch(attempt.url, init)
      if (res.ok) return await res.text()
      lastStatus = res.status
    } catch {
      // siguiente intento
    }
  }

  throw new AppError({
    statusCode: 502,
    message:
      lastStatus === 401
        ? 'Alphacast rechazó la API key (401). Verificá la key en alphacast.io o pegá ALPHACAST_DOWNLOAD_URL desde Download → copiar enlace.'
        : `Alphacast no respondió (último status ${lastStatus || 'sin respuesta'})`,
    code: 'ALPHACAST_BAD_RESPONSE',
  })
}

export async function fetchLatestIpcFromAlphacast(): Promise<FetchedIpcRow[]> {
  const csvText = await downloadAlphacastCsv()
  return parseAlphacastIpcCsv(csvText)
}
