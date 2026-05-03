import type { EconomicIndex } from '@prisma/client'
import { IndexType } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { bulkUpdateByPercentage } from './product.service.js'
import { fetchLatestBcraReserveFromApi } from './bcra.service.js'
import { fetchLatestIPCFromApi } from './indec.service.js'

export function serializeEconomicIndex(row: EconomicIndex) {
  return {
    id: row.id,
    type: row.type,
    period: row.period.toISOString(),
    valuePct: Number(row.valuePct),
    sourceUrl: row.sourceUrl,
    fetchedAt: row.fetchedAt.toISOString(),
  }
}

export async function upsertIpcIndec(input: {
  period: Date
  valuePct: number
  sourceUrl?: string | null
}): Promise<EconomicIndex> {
  const v = Math.round(input.valuePct * 1000) / 1000
  return prisma.economicIndex.upsert({
    where: {
      type_period: {
        type: IndexType.IPC_INDEC,
        period: input.period,
      },
    },
    create: {
      type: IndexType.IPC_INDEC,
      period: input.period,
      valuePct: v,
      sourceUrl: input.sourceUrl ?? null,
    },
    update: {
      valuePct: v,
      fetchedAt: new Date(),
      ...(input.sourceUrl !== undefined ? { sourceUrl: input.sourceUrl } : {}),
    },
  })
}

export async function fetchPersistAndReturnLatestIpc(): Promise<{
  period: Date
  valuePct: number
}> {
  const fetched = await fetchLatestIPCFromApi()
  await upsertIpcIndec({
    period: fetched.period,
    valuePct: fetched.valuePct,
    sourceUrl: fetched.sourceUrl,
  })
  return { period: fetched.period, valuePct: fetched.valuePct }
}

export async function upsertBcraUsdOficial(input: {
  period: Date
  valuePct: number
  sourceUrl?: string | null
}): Promise<EconomicIndex> {
  const v = Math.round(input.valuePct * 1000) / 1000
  return prisma.economicIndex.upsert({
    where: {
      type_period: {
        type: IndexType.BCRA_USD_OFICIAL,
        period: input.period,
      },
    },
    create: {
      type: IndexType.BCRA_USD_OFICIAL,
      period: input.period,
      valuePct: v,
      sourceUrl: input.sourceUrl ?? null,
    },
    update: {
      valuePct: v,
      fetchedAt: new Date(),
      ...(input.sourceUrl !== undefined ? { sourceUrl: input.sourceUrl } : {}),
    },
  })
}

export async function fetchPersistAndReturnLatestBcraUsdOficial(): Promise<{
  period: Date
  valuePct: number
}> {
  const fetched = await fetchLatestBcraReserveFromApi()
  await upsertBcraUsdOficial({
    period: fetched.period,
    valuePct: fetched.value,
    sourceUrl: fetched.sourceUrl,
  })
  return { period: fetched.period, valuePct: fetched.value }
}

export async function hasIpcForPeriod(period: Date): Promise<boolean> {
  const row = await prisma.economicIndex.findUnique({
    where: {
      type_period: {
        type: IndexType.IPC_INDEC,
        period,
      },
    },
    select: { id: true },
  })
  return row !== null
}

export async function getLatestIpcCached(): Promise<EconomicIndex | null> {
  return prisma.economicIndex.findFirst({
    where: { type: IndexType.IPC_INDEC },
    orderBy: { period: 'desc' },
  })
}

export async function getOrFetchLatestIpcPercent(): Promise<number> {
  const row = await prisma.economicIndex.findFirst({
    where: { type: IndexType.IPC_INDEC },
    orderBy: { period: 'desc' },
  })
  if (row) return Number(row.valuePct)
  const p = await fetchPersistAndReturnLatestIpc()
  return p.valuePct
}

export async function getLatestIndicesSnapshot(): Promise<{
  ipc: EconomicIndex | null
  bcra: EconomicIndex | null
}> {
  const [ipc, bcra] = await Promise.all([
    prisma.economicIndex.findFirst({
      where: { type: IndexType.IPC_INDEC },
      orderBy: { period: 'desc' },
    }),
    prisma.economicIndex.findFirst({
      where: { type: IndexType.BCRA_USD_OFICIAL },
      orderBy: { period: 'desc' },
    }),
  ])
  return { ipc, bcra }
}

export async function getIpcHistory(months = 12) {
  return prisma.economicIndex.findMany({
    where: { type: IndexType.IPC_INDEC },
    orderBy: { period: 'desc' },
    take: months,
  })
}

export async function applyIPCToLocal(
  userId: string,
  localId: string,
): Promise<{ updated: number; appliedIpcPct: number }> {
  const pct = await getOrFetchLatestIpcPercent()
  const { updated } = await bulkUpdateByPercentage(userId, {
    localId,
    increasePct: pct,
  })
  return { updated, appliedIpcPct: pct }
}
