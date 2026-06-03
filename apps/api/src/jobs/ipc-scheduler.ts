import cron from 'node-cron'
import { PlanType } from '@prisma/client'

import { env } from '../config/env.js'
import {
  fetchPersistAndReturnLatestBcraUsdOficial,
  fetchPersistAndReturnLatestIpc,
  getLatestBcraUsdCached,
  getLatestIpcCached,
} from '../services/economic-index.service.js'
import { createBcraUsdSpikeNotifications } from '../services/notification.service.js'
import { prisma } from '../lib/prisma.js'
import { sendNewIPCEmail } from '../services/email.service.js'
import {
  createNewIpcNotificationsForActiveUsers,
  hasIpcNotificationForPeriod,
} from '../services/notification.service.js'

const TZ = 'America/Argentina/Buenos_Aires'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isNewIpcPublication(
  before: { period: Date; valuePct: unknown } | null,
  after: { period: Date; valuePct: number },
): boolean {
  if (!before) return true
  if (after.period.getTime() > before.period.getTime()) return true
  if (after.period.getTime() === before.period.getTime()) {
    return Number(before.valuePct) !== after.valuePct
  }
  return false
}

async function notifyUsersOfNewIpc(result: {
  period: Date
  valuePct: number
}): Promise<{ notifications: number; emailsPro: number }> {
  if (await hasIpcNotificationForPeriod(result.period)) {
    return { notifications: 0, emailsPro: 0 }
  }

  const notifications = await createNewIpcNotificationsForActiveUsers({
    valuePct: result.valuePct,
    period: result.period,
  })

  const proUsers = await prisma.user.findMany({
    where: { plan: PlanType.PRO },
    select: { email: true, name: true },
  })

  await Promise.all(
    proUsers.map((u: { email: string; name: string }) =>
      sendNewIPCEmail({
        toEmail: u.email,
        displayName: u.name,
        ipcPct: result.valuePct,
        period: result.period,
      }),
    ),
  )

  return { notifications, emailsPro: proUsers.length }
}

export async function runIpcJob(): Promise<void> {
  const before = await getLatestIpcCached()
  const backoffMs = [1000, 2000, 4000]

  for (let i = 0; i < backoffMs.length; i += 1) {
    try {
      const result = await fetchPersistAndReturnLatestIpc()

      if (!isNewIpcPublication(before, result)) {
        console.info(
          `[scheduler][IPC] sin novedad (${result.period.toISOString().slice(0, 7)} ${result.valuePct.toFixed(3)}%)`,
        )
        return
      }

      const { notifications, emailsPro } = await notifyUsersOfNewIpc(result)
      console.info(
        `[scheduler][IPC] publicado ${result.valuePct.toFixed(3)}% (${result.period.toISOString().slice(0, 7)}), notifs: ${notifications}, emails-pro: ${emailsPro}`,
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
      `[scheduler][IPC] fuentes IPC no disponibles, se mantiene cache ${cached.period.toISOString().slice(0, 7)}`,
    )
    return
  }

  console.error('[scheduler][IPC] fuentes IPC no disponibles y sin cache local')
}

async function runBcraJob(): Promise<void> {
  const before = await getLatestBcraUsdCached()
  try {
    const result = await fetchPersistAndReturnLatestBcraUsdOficial()
    console.info(
      `[scheduler][BCRA] USD ${result.usdRate.toFixed(2)} · variación ${result.valuePct.toFixed(3)}% (${result.period.toISOString().slice(0, 10)})`,
    )

    const threshold = env.BCRA_USD_ALERT_THRESHOLD_PCT
    const isNewDay =
      !before || result.period.getTime() > before.period.getTime()
    if (
      isNewDay &&
      Math.abs(result.valuePct) >= threshold
    ) {
      const count = await createBcraUsdSpikeNotifications({
        valuePct: result.valuePct,
        period: result.period,
        usdRate: result.usdRate,
      })
      console.info(`[scheduler][BCRA] alertas USD: ${count}`)
    }
  } catch (error) {
    console.error('[scheduler][BCRA] error al actualizar indice', error)
  }
}

export async function catchUpBcraIfMissing(): Promise<void> {
  const cached = await getLatestBcraUsdCached()
  if (cached) return
  console.info('[scheduler][BCRA] sin USD en base, sincronización al arrancar')
  await runBcraJob()
}

/** Si no hay IPC en DB (p. ej. deploy nuevo), intenta una sincronización al arrancar. */
export async function catchUpIpcIfMissing(): Promise<void> {
  const cached = await getLatestIpcCached()
  if (cached) return
  console.info('[scheduler][IPC] sin IPC en base, sincronización al arrancar')
  await runIpcJob()
}

export function initScheduler(): void {
  // Diario 03:00 AR — sincroniza todas las series IPC (divisiones COICOP).
  cron.schedule(
    '0 3 * * *',
    () => {
      void runIpcJob()
    },
    { timezone: TZ },
  )

  cron.schedule(
    '30 3 * * *',
    () => {
      void runBcraJob()
    },
    { timezone: TZ },
  )

  void catchUpIpcIfMissing()
  void catchUpBcraIfMissing()

  console.info('[scheduler] jobs IPC/BCRA inicializados')
}
