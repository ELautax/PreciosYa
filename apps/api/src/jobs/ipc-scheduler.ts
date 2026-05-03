import cron from 'node-cron'

import {
  fetchPersistAndReturnLatestBcraUsdOficial,
  fetchPersistAndReturnLatestIpc,
  getLatestIpcCached,
  hasIpcForPeriod,
} from '../services/economic-index.service.js'

const TZ = 'America/Argentina/Buenos_Aires'

function startOfUtcMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isFirstBusinessDayWindow(now: Date): boolean {
  const y = now.getFullYear()
  const m = now.getMonth()

  for (let day = 1; day <= 7; day += 1) {
    const date = new Date(y, m, day)
    const wd = date.getDay()
    if (wd >= 1 && wd <= 5) {
      return date.getDate() === now.getDate()
    }
  }

  return false
}

async function runIpcJob(): Promise<void> {
  const now = new Date()
  if (!isFirstBusinessDayWindow(now)) {
    console.info('[scheduler][IPC] no es primer dia habil, se omite')
    return
  }

  const period = startOfUtcMonth(now)
  if (await hasIpcForPeriod(period)) {
    console.info('[scheduler][IPC] indice del mes ya existe, se omite')
    return
  }

  const backoffMs = [1000, 2000, 4000]
  for (let i = 0; i < backoffMs.length; i += 1) {
    try {
      const result = await fetchPersistAndReturnLatestIpc()
      console.info(
        `[scheduler][IPC] guardado ${result.valuePct.toFixed(3)} para ${result.period.toISOString()}`,
      )
      return
    } catch (error) {
      if (i === backoffMs.length - 1) break
      const waitMs = backoffMs[i]
      if (waitMs === undefined) break
      console.warn(`[scheduler][IPC] intento ${i + 1} fallido, reintentando`, error)
      await delay(waitMs)
    }
  }

  const cached = await getLatestIpcCached()
  if (cached) {
    console.warn(
      `[scheduler][IPC] INDEC no disponible, se mantiene cache ${cached.period.toISOString()}`,
    )
    return
  }

  console.error('[scheduler][IPC] INDEC no disponible y sin cache local')
}

async function runBcraJob(): Promise<void> {
  try {
    const result = await fetchPersistAndReturnLatestBcraUsdOficial()
    console.info(
      `[scheduler][BCRA] guardado ${result.valuePct.toFixed(3)} para ${result.period.toISOString()}`,
    )
  } catch (error) {
    console.error('[scheduler][BCRA] error al actualizar indice', error)
  }
}

export function initScheduler(): void {
  cron.schedule(
    '0 9 1-7 * 1-5',
    () => {
      void runIpcJob()
    },
    { timezone: TZ },
  )

  cron.schedule(
    '0 10 * * 1-5',
    () => {
      void runBcraJob()
    },
    { timezone: TZ },
  )

  console.info('[scheduler] jobs IPC/BCRA inicializados')
}
