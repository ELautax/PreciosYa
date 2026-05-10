import type { EconomicIndex } from '@prisma/client'
import { IndexType } from '@prisma/client'
import { applyIPC, calculateSalePrice, isMarginAlert } from 'shared'

import { prisma } from '../lib/prisma.js'
import { fetchLatestBcraReserveFromApi } from './bcra.service.js'
import { fetchLatestIPCFromApi } from './indec.service.js'
import { assertLocalOwnership } from './local.service.js'

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
  type?: IndexType
  period: Date
  valuePct: number
  sourceUrl?: string | null
}): Promise<EconomicIndex> {
  const type = input.type ?? IndexType.IPC_INDEC
  const v = Math.round(input.valuePct * 1000) / 1000
  return prisma.economicIndex.upsert({
    where: {
      type_period: {
        type,
        period: input.period,
      },
    },
    create: {
      type,
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
  const fetched = await fetchLatestIPCFromApi(IndexType.IPC_INDEC)
  await upsertIpcIndec({
    type: IndexType.IPC_INDEC,
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
  const latest = await getOrFetchLatestIpcByType(IndexType.IPC_INDEC)
  return latest.valuePct
}

export async function getOrFetchLatestIpcByType(
  requestedType: IndexType,
): Promise<{
  requestedType: IndexType
  appliedType: IndexType
  valuePct: number
  period: Date
}> {
  const row = await prisma.economicIndex.findFirst({
    where: { type: requestedType },
    orderBy: { period: 'desc' },
  })
  if (row) {
    return {
      requestedType,
      appliedType: requestedType,
      valuePct: Number(row.valuePct),
      period: row.period,
    }
  }

  if (requestedType !== IndexType.IPC_INDEC) {
    try {
      const fetched = await fetchLatestIPCFromApi(requestedType)
      const saved = await upsertIpcIndec({
        type: requestedType,
        period: fetched.period,
        valuePct: fetched.valuePct,
        sourceUrl: fetched.sourceUrl,
      })
      return {
        requestedType,
        appliedType: requestedType,
        valuePct: Number(saved.valuePct),
        period: saved.period,
      }
    } catch {
      const fallback = await getOrFetchLatestIpcByType(IndexType.IPC_INDEC)
      return {
        requestedType,
        appliedType: IndexType.IPC_INDEC,
        valuePct: fallback.valuePct,
        period: fallback.period,
      }
    }
  }

  const fetched = await fetchPersistAndReturnLatestIpc()
  return {
    requestedType,
    appliedType: IndexType.IPC_INDEC,
    valuePct: fetched.valuePct,
    period: fetched.period,
  }
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

export type IpcCategoryBreakdown = {
  categoryId: string | null
  categoryName: string
  requestedIndexType: IndexType
  appliedIndexType: IndexType
  ipcPct: number
  productCount: number
}

export async function getIpcBreakdownForLocal(
  userId: string,
  localId: string,
) {
  await assertLocalOwnership(userId, localId)

  const categories = await prisma.category.findMany({
    where: { localId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, preferredIndex: true },
  })
  const counts = await prisma.product.groupBy({
    by: ['categoryId'],
    where: { localId, isActive: true },
    _count: { _all: true },
  })
  const countByCategory = new Map<string, number>()
  let uncategorizedCount = 0
  for (const c of counts) {
    if (c.categoryId) countByCategory.set(c.categoryId, c._count._all)
    else uncategorizedCount = c._count._all
  }

  const requestedTypes = new Set<IndexType>([
    IndexType.IPC_INDEC,
    ...categories.map((c) => c.preferredIndex),
  ])
  const resolvedByType = new Map<
    IndexType,
    {
      requestedType: IndexType
      appliedType: IndexType
      valuePct: number
      period: Date
    }
  >()
  for (const requestedType of requestedTypes) {
    const resolved = await getOrFetchLatestIpcByType(requestedType)
    resolvedByType.set(requestedType, resolved)
  }

  const breakdown: IpcCategoryBreakdown[] = categories.map((category) => {
    const resolved = resolvedByType.get(category.preferredIndex)
    if (!resolved) {
      throw new Error('IPC breakdown missing for category')
    }
    return {
      categoryId: category.id,
      categoryName: category.name,
      requestedIndexType: category.preferredIndex,
      appliedIndexType: resolved.appliedType,
      ipcPct: resolved.valuePct,
      productCount: countByCategory.get(category.id) ?? 0,
    }
  })
  if (uncategorizedCount > 0) {
    const resolvedGeneral = resolvedByType.get(IndexType.IPC_INDEC)
    if (!resolvedGeneral) {
      throw new Error('IPC general missing for uncategorized')
    }
    breakdown.push({
      categoryId: null,
      categoryName: 'Sin categoría',
      requestedIndexType: IndexType.IPC_INDEC,
      appliedIndexType: resolvedGeneral.appliedType,
      ipcPct: resolvedGeneral.valuePct,
      productCount: uncategorizedCount,
    })
  }

  const totalProducts = breakdown.reduce((acc, item) => acc + item.productCount, 0)
  return { breakdown, totalProducts }
}

export async function applyIPCToLocal(
  userId: string,
  localId: string,
): Promise<{
  updated: number
  appliedIpcPct: number
  breakdown: IpcCategoryBreakdown[]
}> {
  const local = await assertLocalOwnership(userId, localId)
  const { breakdown } = await getIpcBreakdownForLocal(userId, localId)
  const breakdownMap = new Map<
    string,
    {
      appliedIndexType: IndexType
      ipcPct: number
    }
  >()
  for (const item of breakdown) {
    breakdownMap.set(item.categoryId ?? 'none', {
      appliedIndexType: item.appliedIndexType,
      ipcPct: item.ipcPct,
    })
  }

  const products = await prisma.product.findMany({
    where: { localId, isActive: true },
    select: {
      id: true,
      categoryId: true,
      cost: true,
      marginPct: true,
    },
  })
  if (products.length === 0) {
    return { updated: 0, appliedIpcPct: 0, breakdown }
  }

  const minMarginPct = Number(local.minMarginPct)
  const now = new Date()
  await prisma.$transaction(async (tx) => {
    for (const product of products) {
      const key = product.categoryId ?? 'none'
      const cfg = breakdownMap.get(key) ?? {
        appliedIndexType: IndexType.IPC_INDEC,
        ipcPct: 0,
      }
      const oldCost = Number(product.cost)
      const marginPct = Number(product.marginPct)
      const ipc = applyIPC(oldCost, cfg.ipcPct)
      const salePrice = calculateSalePrice(ipc.newCost, marginPct)
      const isAlert = isMarginAlert(marginPct, minMarginPct)

      await tx.product.update({
        where: { id: product.id },
        data: {
          cost: ipc.newCost,
          salePrice,
          isMarginAlert: isAlert,
        },
      })
      await tx.priceHistory.create({
        data: {
          productId: product.id,
          cost: ipc.newCost,
          marginPct,
          salePrice,
          changeReason: 'IPC_INDEC',
          ipcReference: cfg.ipcPct,
          note: `Índice aplicado: ${cfg.appliedIndexType}`,
          recordedAt: now,
        },
      })
    }
  })

  const weightedPct =
    breakdown.reduce((acc, item) => acc + item.ipcPct * item.productCount, 0) /
    Math.max(products.length, 1)

  return {
    updated: products.length,
    appliedIpcPct: Math.round(weightedPct * 100) / 100,
    breakdown,
  }
}
