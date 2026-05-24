import { IndexType } from '@prisma/client'

import { AppError } from '../../utils/AppError.js'
import type { FetchedIpcRow } from './ipc-fetch.types.js'

const ARGLY_IPC_URL = 'https://api.argly.com.ar/v1/ipc'

type ArglyIpcResponse = {
  data?: {
    indice_ipc?: number
    mes?: number
    anio?: number
  }
}

function startOfUtcMonth(year: number, month1to12: number): Date {
  return new Date(Date.UTC(year, month1to12 - 1, 1))
}

/** IPC nacional mensual (solo general) vía Argly — respaldo si Alphacast no responde. */
export async function fetchGeneralIpcFromArgly(): Promise<FetchedIpcRow> {
  let res: Response
  try {
    res = await fetch(ARGLY_IPC_URL, { signal: AbortSignal.timeout(25_000) })
  } catch {
    throw new AppError({
      statusCode: 502,
      message: 'No se pudo contactar Argly',
      code: 'ARGLY_UNAVAILABLE',
    })
  }

  if (!res.ok) {
    throw new AppError({
      statusCode: 502,
      message: `Argly respondió ${res.status}`,
      code: 'ARGLY_BAD_RESPONSE',
    })
  }

  const json = (await res.json()) as ArglyIpcResponse
  const pct = json.data?.indice_ipc
  const mes = json.data?.mes
  const anio = json.data?.anio
  if (
    typeof pct !== 'number' ||
    typeof mes !== 'number' ||
    typeof anio !== 'number' ||
    mes < 1 ||
    mes > 12
  ) {
    throw new AppError({
      statusCode: 502,
      message: 'Respuesta Argly IPC inválida',
      code: 'ARGLY_PARSE_ERROR',
    })
  }

  return {
    indexType: IndexType.IPC_INDEC,
    period: startOfUtcMonth(anio, mes),
    valuePct: Math.round(pct * 1000) / 1000,
    sourceUrl: ARGLY_IPC_URL,
  }
}
