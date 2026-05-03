import { PlanType } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { fetchPersistAndReturnLatestIpc } from './economic-index.service.js'

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
    items: rows.map((u) => ({
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

export async function getAdminIndices(limit = 20) {
  const rows = await prisma.economicIndex.findMany({
    orderBy: { period: 'desc' },
    take: limit,
  })
  return rows.map((x) => ({
    id: x.id,
    type: x.type,
    period: x.period.toISOString(),
    valuePct: Number(x.valuePct),
    sourceUrl: x.sourceUrl,
    fetchedAt: x.fetchedAt.toISOString(),
  }))
}

export async function forceFetchIpcFromAdmin() {
  return fetchPersistAndReturnLatestIpc()
}
