import { Prisma, type Notification, type NotifType } from '@prisma/client'

import { prisma } from '../lib/prisma.js'

export function serializeNotification(n: Notification) {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    metadata: n.metadata,
    createdAt: n.createdAt.toISOString(),
  }
}

function toInputJsonValue(
  value: unknown,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined
  if (value === null) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}

export async function createNotification(input: {
  userId: string
  type: NotifType
  title: string
  body: string
  metadata?: unknown
}): Promise<Notification> {
  const metadata = toInputJsonValue(input.metadata)
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title.trim(),
      body: input.body.trim(),
      ...(metadata !== undefined ? { metadata } : {}),
    },
  })
}

export async function createBulkNotifications(
  inputs: Array<{
    userId: string
    type: NotifType
    title: string
    body: string
    metadata?: unknown
  }>,
): Promise<number> {
  if (inputs.length === 0) return 0
  const data = inputs.map((x) => {
    const metadata = toInputJsonValue(x.metadata)
    return {
      userId: x.userId,
      type: x.type,
      title: x.title.trim(),
      body: x.body.trim(),
      ...(metadata !== undefined ? { metadata } : {}),
    }
  })
  const result = await prisma.notification.createMany({
    data,
  })
  return result.count
}

export async function getUserNotifications(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{
  items: ReturnType<typeof serializeNotification>[]
  total: number
  page: number
  limit: number
}> {
  const safePage = Math.max(1, page)
  const safeLimit = Math.min(100, Math.max(1, limit))
  const skip = (safePage - 1) * safeLimit

  const [rows, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
    }),
    prisma.notification.count({ where: { userId } }),
  ])

  return {
    items: rows.map(serializeNotification),
    total,
    page: safePage,
    limit: safeLimit,
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

export async function markAsRead(userId: string, id: string): Promise<boolean> {
  const result = await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  })
  return result.count > 0
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
  return result.count
}

export async function hasIpcNotificationForPeriod(period: Date): Promise<boolean> {
  const periodKey = period.toISOString().slice(0, 7)
  const recent = await prisma.notification.findMany({
    where: { type: 'NEW_IPC' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { metadata: true },
  })
  return recent.some((row) => {
    if (!row.metadata || typeof row.metadata !== 'object' || Array.isArray(row.metadata)) {
      return false
    }
    const meta = row.metadata as { period?: string }
    return typeof meta.period === 'string' && meta.period.startsWith(periodKey)
  })
}

export async function hasBcraUsdNotificationForPeriod(period: Date): Promise<boolean> {
  const periodKey = period.toISOString().slice(0, 10)
  const recent = await prisma.notification.findMany({
    where: { type: 'BCRA_USD_ALERT' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { metadata: true },
  })
  return recent.some((row) => {
    if (!row.metadata || typeof row.metadata !== 'object' || Array.isArray(row.metadata)) {
      return false
    }
    const meta = row.metadata as { period?: string }
    return typeof meta.period === 'string' && meta.period.startsWith(periodKey)
  })
}

export async function createBcraUsdSpikeNotifications(input: {
  valuePct: number
  period: Date
  usdRate: number
}): Promise<number> {
  if (await hasBcraUsdNotificationForPeriod(input.period)) {
    return 0
  }

  const users = await prisma.user.findMany({
    select: { id: true },
  })
  if (users.length === 0) return 0

  const sign = input.valuePct >= 0 ? '+' : ''
  return createBulkNotifications(
    users.map((u: { id: string }) => ({
      userId: u.id,
      type: 'BCRA_USD_ALERT' as const,
      title: 'Salto del dólar oficial',
      body: `USD BCRA ${input.usdRate.toFixed(2)} (${sign}${input.valuePct.toFixed(2)}% vs día anterior). Revisá costos indexados en USD.`,
      metadata: {
        valuePct: input.valuePct,
        usdRate: input.usdRate,
        period: input.period.toISOString(),
      },
    })),
  )
}

export async function createNewIpcNotificationsForActiveUsers(input: {
  valuePct: number
  period: Date
}): Promise<number> {
  if (await hasIpcNotificationForPeriod(input.period)) {
    return 0
  }

  const users = await prisma.user.findMany({
    select: { id: true },
  })
  if (users.length === 0) return 0

  return createBulkNotifications(
    users.map((u: { id: string }) => ({
      userId: u.id,
      type: 'NEW_IPC' as const,
      title: 'Nuevo IPC disponible',
      body: `Se publicó IPC ${input.valuePct.toFixed(2)}% (${input.period.toISOString().slice(0, 7)}).`,
      metadata: {
        valuePct: input.valuePct,
        period: input.period.toISOString(),
      },
    })),
  )
}
