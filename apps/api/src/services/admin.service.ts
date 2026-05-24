import type { EconomicIndex, User } from '@prisma/client'
import { IndexType, PlanType } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/AppError.js'
import {
  serializeEconomicIndex,
  upsertIpcIndec,
} from './economic-index.service.js'
import { fetchAndPersistAllIpcSeries } from './ipc-fetch/ipc-fetch.service.js'

const IPC_INDEX_TYPES = Object.values(IndexType).filter((t) => t.startsWith('IPC_'))

export async function listUsersForAdmin(input: { page?: number; search?: string }) {
  const page = Math.max(1, input.page ?? 1)
  const limit = 20
  const skip = (page - 1) * limit
  const where = input.search
    ? {
        OR: [
          { email: { contains: input.search, mode: 'insensitive' as const } },
          { name: { contains: input.search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return {
    items: rows.map((u: User) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      plan: u.plan,
      planExpiresAt: u.planExpiresAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  }
}

export async function updateUserPlanForAdmin(input: {
  userId: string
  plan: PlanType
  planExpiresAt?: Date | null
}) {
  const row = await prisma.user.update({
    where: { id: input.userId },
    data: {
      plan: input.plan,
      ...(input.planExpiresAt !== undefined ? { planExpiresAt: input.planExpiresAt } : {}),
    },
  })
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    plan: row.plan,
    planExpiresAt: row.planExpiresAt?.toISOString() ?? null,
  }
}

export async function getAdminStats() {
  const [users, locals, products, alerts] = await Promise.all([
    prisma.user.count(),
    prisma.local.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, isMarginAlert: true } }),
  ])
  return { users, locals, products, alerts }
}

export async function getAdminIndices() {
  const latestGeneral = await prisma.economicIndex.findFirst({
    where: { type: IndexType.IPC_INDEC },
    orderBy: { period: 'desc' },
  })
  if (!latestGeneral) return []

  const rows = await prisma.economicIndex.findMany({
    where: {
      period: latestGeneral.period,
      type: { in: IPC_INDEX_TYPES },
    },
    orderBy: { type: 'asc' },
  })
  return rows.map((x: EconomicIndex) => serializeEconomicIndex(x))
}

export async function forceFetchIpcFromAdmin() {
  const { results, general } = await fetchAndPersistAllIpcSeries()
  if (results.length === 0) {
    throw new AppError({
      statusCode: 502,
      message:
        'No se pudieron obtener datos IPC (Alphacast/Argly). Verificá ALPHACAST_API_KEY en Railway o usá carga manual.',
      code: 'IPC_FETCH_FAILED',
    })
  }
  const fallback = results[0]!
  const period = general?.period ?? fallback.period
  const valuePct = general?.valuePct ?? fallback.valuePct
  return {
    period: period.toISOString(),
    valuePct,
    seriesUpdated: results.length,
    indices: results.map((r) => ({
      type: r.indexType,
      period: r.period.toISOString(),
      valuePct: r.valuePct,
    })),
  }
}

export async function upsertManualIpcFromAdmin(input: {
  period: string
  indices: { type: IndexType; valuePct: number }[]
}) {
  const match = /^(\d{4})-(\d{2})$/.exec(input.period.trim())
  if (!match) {
    throw new AppError({
      statusCode: 400,
      message: 'period debe ser YYYY-MM (ej. 2026-04)',
      code: 'INVALID_PERIOD',
    })
  }
  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) {
    throw new AppError({
      statusCode: 400,
      message: 'Mes inválido en period',
      code: 'INVALID_PERIOD',
    })
  }
  const periodDate = new Date(Date.UTC(year, month - 1, 1))

  const saved: ReturnType<typeof serializeEconomicIndex>[] = []
  for (const item of input.indices) {
    if (!IPC_INDEX_TYPES.includes(item.type)) {
      throw new AppError({
        statusCode: 400,
        message: `Tipo de índice no permitido: ${item.type}`,
        code: 'INVALID_INDEX_TYPE',
      })
    }
    const row = await upsertIpcIndec({
      type: item.type,
      period: periodDate,
      valuePct: item.valuePct,
      sourceUrl: 'manual:admin',
    })
    saved.push(serializeEconomicIndex(row))
  }

  return {
    period: periodDate.toISOString(),
    count: saved.length,
    indices: saved,
  }
}
