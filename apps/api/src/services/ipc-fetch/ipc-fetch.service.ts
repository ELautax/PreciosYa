import { IndexType } from '@prisma/client'

import { env } from '../../config/env.js'
import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { upsertIpcIndec } from '../economic-index.service.js'
import { fetchGeneralIpcFromArgly } from './argly.service.js'
import { fetchLatestIpcFromAlphacast } from './alphacast.service.js'
import type { FetchedIpcRow } from './ipc-fetch.types.js'

export type { FetchedIpcRow } from './ipc-fetch.types.js'

export type IpcFetchSource = 'alphacast' | 'argly' | 'none'

/** Borra divisiones COICOP rellenadas con el mismo % que Argly (dato engañoso en admin). */
async function clearArglyDivisionStubsForPeriod(period: Date): Promise<void> {
  const divisionTypes = Object.values(IndexType).filter(
    (t) => t.startsWith('IPC_INDEC_') && t !== IndexType.IPC_INDEC,
  )
  await prisma.economicIndex.deleteMany({
    where: {
      period,
      type: { in: divisionTypes },
      OR: [
        { sourceUrl: { contains: 'Argly' } },
        { sourceUrl: { contains: 'respaldo general Argly' } },
      ],
    },
  })
}

async function fetchAndPersistFromAlphacast(): Promise<{
  results: FetchedIpcRow[]
  general: FetchedIpcRow | null
}> {
  const rows = await fetchLatestIpcFromAlphacast()
  if (rows.length === 0) {
    return { results: [], general: null }
  }

  const period = rows[0]!.period
  await clearArglyDivisionStubsForPeriod(period)

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

/** Argly solo trae IPC general: no inventar el mismo % en cada división COICOP. */
async function fetchAndPersistFromArglyFallback(): Promise<{
  results: FetchedIpcRow[]
  general: FetchedIpcRow
}> {
  const general = await fetchGeneralIpcFromArgly()
  await upsertIpcIndec({
    type: general.indexType,
    period: general.period,
    valuePct: general.valuePct,
    sourceUrl: general.sourceUrl,
  })

  console.warn(
    `[ipc-fetch] Alphacast no disponible; solo IPC general Argly (${general.valuePct}%, ${general.period.toISOString().slice(0, 7)}). Configurá ALPHACAST_API_KEY para divisiones COICOP.`,
  )
  return { results: [general], general }
}

export async function fetchAndPersistAllIpcSeries(): Promise<{
  results: FetchedIpcRow[]
  general: FetchedIpcRow | null
  source: IpcFetchSource
}> {
  const hasAlphacast = Boolean(env.ALPHACAST_API_KEY?.trim() || env.ALPHACAST_DOWNLOAD_URL)

  if (hasAlphacast) {
    try {
      const fromAlphacast = await fetchAndPersistFromAlphacast()
      if (fromAlphacast.results.length > 0) {
        console.info(
          `[ipc-fetch] IPC desde Alphacast (${fromAlphacast.results.length} series, mes ${fromAlphacast.general?.period.toISOString().slice(0, 7) ?? '?'})`,
        )
        return { ...fromAlphacast, source: 'alphacast' }
      }
    } catch (e) {
      console.error('[ipc-fetch] Alphacast falló; probando Argly (solo IPC general)', e)
    }
  } else {
    console.warn('[ipc-fetch] ALPHACAST_API_KEY no configurada; probando Argly')
  }

  try {
    const fromArgly = await fetchAndPersistFromArglyFallback()
    return { ...fromArgly, source: 'argly' }
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
