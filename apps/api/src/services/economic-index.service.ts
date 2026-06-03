import type { EconomicIndex, PrismaClient } from '@prisma/client'
import { IndexType } from '@prisma/client'
import { applyIPC, calculateSalePrice, isMarginAlert } from 'shared'

import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/AppError.js'
import {
  fetchLatestBcraUsdOficialFromApi,
  parseUsdRateFromSourceUrl,
} from './bcra.service.js'
import { fetchAndPersistAllIpcSeries } from './ipc-fetch/ipc-fetch.service.js'
import { assertLocalOwnership } from './local.service.js'

export function serializeEconomicIndex(row: EconomicIndex) {
  const usdRateArs =
    row.type === IndexType.BCRA_USD_OFICIAL || row.type === IndexType.BCRA_USD_MEP
      ? parseUsdRateFromSourceUrl(row.sourceUrl)
      : null
  return {
    id: row.id,
    type: row.type,
    period: row.period.toISOString(),
    valuePct: Number(row.valuePct),
    usdRateArs,
    sourceUrl: row.sourceUrl,
    fetchedAt: row.fetchedAt.toISOString(),
  }
}

const BCRA_INDEX_TYPES: IndexType[] = [IndexType.BCRA_USD_OFICIAL, IndexType.BCRA_USD_MEP]

export function isBcraIndexType(type: IndexType): boolean {
  return BCRA_INDEX_TYPES.includes(type)
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
  const { general } = await fetchAndPersistAllIpcSeries()
  if (!general) {
    throw new AppError({
      statusCode: 502,
      message: 'No se pudo obtener IPC. Configurá ALPHACAST_API_KEY o usá carga manual en Admin.',
      code: 'IPC_UNAVAILABLE',
    })
  }
  return { period: general.period, valuePct: general.valuePct }
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
  usdRate: number
}> {
  const fetched = await fetchLatestBcraUsdOficialFromApi()
  await upsertBcraUsdOficial({
    period: fetched.period,
    valuePct: fetched.variationPct,
    sourceUrl: fetched.sourceUrl,
  })
  return {
    period: fetched.period,
    valuePct: fetched.variationPct,
    usdRate: fetched.usdRate,
  }
}

export async function getLatestBcraUsdCached(): Promise<EconomicIndex | null> {
  return prisma.economicIndex.findFirst({
    where: { type: IndexType.BCRA_USD_OFICIAL },
    orderBy: { period: 'desc' },
  })
}

export async function getOrFetchLatestBcraUsd(): Promise<{
  valuePct: number
  period: Date
  usdRateArs: number | null
}> {
  const row = await getLatestBcraUsdCached()
  if (row) {
    return {
      valuePct: Number(row.valuePct),
      period: row.period,
      usdRateArs: parseUsdRateFromSourceUrl(row.sourceUrl),
    }
  }
  try {
    const fetched = await fetchPersistAndReturnLatestBcraUsdOficial()
    return {
      valuePct: fetched.valuePct,
      period: fetched.period,
      usdRateArs: fetched.usdRate,
    }
  } catch {
    throw new AppError({
      statusCode: 502,
      message: 'No se pudo obtener cotización USD del BCRA',
      code: 'BCRA_UNAVAILABLE',
    })
  }
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

  try {
    await fetchAndPersistAllIpcSeries()
  } catch {
    // sin red o APIs caídas: se intenta leer cache abajo
  }

  const afterFetch = await prisma.economicIndex.findFirst({
    where: { type: requestedType },
    orderBy: { period: 'desc' },
  })
  if (afterFetch) {
    return {
      requestedType,
      appliedType: requestedType,
      valuePct: Number(afterFetch.valuePct),
      period: afterFetch.period,
    }
  }

  if (isBcraIndexType(requestedType)) {
    const bcra = await getOrFetchLatestBcraUsd()
    return {
      requestedType,
      appliedType: requestedType,
      valuePct: bcra.valuePct,
      period: bcra.period,
    }
  }

  if (requestedType !== IndexType.IPC_INDEC) {
    const fallback = await getOrFetchLatestIpcByType(IndexType.IPC_INDEC)
    return {
      requestedType,
      appliedType: IndexType.IPC_INDEC,
      valuePct: fallback.valuePct,
      period: fallback.period,
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

/** Filas BCRA viejas (reservas) o sin tasa en sourceUrl — forzar refresh. */
export function bcraRowNeedsRefresh(row: EconomicIndex | null): boolean {
  if (!row) return true
  const rate = parseUsdRateFromSourceUrl(row.sourceUrl)
  if (rate !== null) return false
  const v = Number(row.valuePct)
  return !Number.isFinite(v) || v > 50 || v < -50
}

export async function ensureFreshBcraInSnapshot(): Promise<{
  ipc: EconomicIndex | null
  bcra: EconomicIndex | null
}> {
  let snapshot = await getLatestIndicesSnapshot()
  if (!snapshot.ipc) {
    try {
      await fetchPersistAndReturnLatestIpc()
      snapshot = await getLatestIndicesSnapshot()
    } catch {
      /* cache vacío */
    }
  }
  if (bcraRowNeedsRefresh(snapshot.bcra)) {
    try {
      await fetchPersistAndReturnLatestBcraUsdOficial()
      snapshot = await getLatestIndicesSnapshot()
    } catch {
      /* sin red */
    }
  }
  return snapshot
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
  /** true si no hay dato de división y se usó IPC nivel general */
  usedGeneralFallback: boolean
  ipcPct: number
  productCount: number
}

type CategoryBreakdownRow = {
  id: string
  name: string
  preferredIndex: IndexType
}

export async function getIpcBreakdownForLocal(
  userId: string,
  localId: string,
) {
  await assertLocalOwnership(userId, localId)

  const categories: CategoryBreakdownRow[] = await prisma.category.findMany({
    where: {
      localId,
      isActive: true,
      preferredIndex: { notIn: BCRA_INDEX_TYPES },
    },
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
  for (const c of counts as Array<{
    categoryId: string | null
    _count: { _all: number }
  }>) {
    if (c.categoryId) countByCategory.set(c.categoryId, c._count._all)
    else uncategorizedCount = c._count._all
  }

  const requestedTypes = new Set<IndexType>([
    IndexType.IPC_INDEC,
    ...categories.map((c: CategoryBreakdownRow) => c.preferredIndex),
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

  const breakdown: IpcCategoryBreakdown[] = categories.map((category: CategoryBreakdownRow) => {
    const resolved = resolvedByType.get(category.preferredIndex)
    if (!resolved) {
      throw new Error('IPC breakdown missing for category')
    }
    return {
      categoryId: category.id,
      categoryName: category.name,
      requestedIndexType: category.preferredIndex,
      appliedIndexType: resolved.appliedType,
      usedGeneralFallback: resolved.appliedType !== category.preferredIndex,
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
      usedGeneralFallback: false,
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

  const usdCategoryIds = await prisma.category.findMany({
    where: { localId, isActive: true, preferredIndex: { in: BCRA_INDEX_TYPES } },
    select: { id: true },
  })
  const skipCategoryIds = new Set(usdCategoryIds.map((c) => c.id))

  const products = await prisma.product.findMany({
    where: { localId, isActive: true },
    select: {
      id: true,
      categoryId: true,
      cost: true,
      marginPct: true,
    },
  })
  const ipcProducts = products.filter(
    (p) => !p.categoryId || !skipCategoryIds.has(p.categoryId),
  )
  if (ipcProducts.length === 0) {
    return { updated: 0, appliedIpcPct: 0, breakdown }
  }

  const minMarginPct = Number(local.minMarginPct)
  const now = new Date()
  await prisma.$transaction(async (tx) => {
    const db = tx as PrismaClient
    for (const product of ipcProducts) {
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

      await db.product.update({
        where: { id: product.id },
        data: {
          cost: ipc.newCost,
          salePrice,
          isMarginAlert: isAlert,
        },
      })
      await db.priceHistory.create({
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
    Math.max(ipcProducts.length, 1)

  const ipcPeriod = (await getOrFetchLatestIpcByType(IndexType.IPC_INDEC)).period
  if (ipcProducts.length > 0) {
    await prisma.local.update({
      where: { id: localId },
      data: { lastIpcAppliedPeriod: ipcPeriod },
    })
  }

  return {
    updated: ipcProducts.length,
    appliedIpcPct: Math.round(weightedPct * 100) / 100,
    breakdown,
  }
}

export type UsdCategoryBreakdown = {
  categoryId: string
  categoryName: string
  indexType: IndexType
  variationPct: number
  productCount: number
}

export async function getUsdBreakdownForLocal(userId: string, localId: string) {
  await assertLocalOwnership(userId, localId)

  const bcra = await getOrFetchLatestBcraUsd()
  const categories = await prisma.category.findMany({
    where: {
      localId,
      isActive: true,
      preferredIndex: { in: BCRA_INDEX_TYPES },
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, preferredIndex: true },
  })

  const counts = await prisma.product.groupBy({
    by: ['categoryId'],
    where: { localId, isActive: true },
    _count: { _all: true },
  })
  const countByCategory = new Map<string, number>()
  for (const c of counts as Array<{ categoryId: string | null; _count: { _all: number } }>) {
    if (c.categoryId) countByCategory.set(c.categoryId, c._count._all)
  }

  const breakdown: UsdCategoryBreakdown[] = categories.map((category) => ({
    categoryId: category.id,
    categoryName: category.name,
    indexType: category.preferredIndex,
    variationPct: bcra.valuePct,
    productCount: countByCategory.get(category.id) ?? 0,
  }))

  const totalProducts = breakdown.reduce((acc, item) => acc + item.productCount, 0)
  return {
    breakdown,
    totalProducts,
    variationPct: bcra.valuePct,
    usdRateArs: bcra.usdRateArs,
    period: bcra.period,
  }
}

export async function applyUsdToLocal(
  userId: string,
  localId: string,
): Promise<{
  updated: number
  appliedUsdPct: number
  breakdown: UsdCategoryBreakdown[]
}> {
  const local = await assertLocalOwnership(userId, localId)
  const { breakdown, variationPct, period: usdPeriod } = await getUsdBreakdownForLocal(
    userId,
    localId,
  )

  const usdCategoryIds = new Set(breakdown.map((b) => b.categoryId))
  if (usdCategoryIds.size === 0) {
    return { updated: 0, appliedUsdPct: variationPct, breakdown }
  }

  const products = await prisma.product.findMany({
    where: {
      localId,
      isActive: true,
      categoryId: { in: [...usdCategoryIds] },
    },
    select: {
      id: true,
      categoryId: true,
      cost: true,
      marginPct: true,
    },
  })
  if (products.length === 0) {
    return { updated: 0, appliedUsdPct: variationPct, breakdown }
  }

  const minMarginPct = Number(local.minMarginPct)
  const now = new Date()
  await prisma.$transaction(async (tx) => {
    const db = tx as PrismaClient
    for (const product of products) {
      const oldCost = Number(product.cost)
      const marginPct = Number(product.marginPct)
      const adjusted = applyIPC(oldCost, variationPct)
      const salePrice = calculateSalePrice(adjusted.newCost, marginPct)
      const isAlert = isMarginAlert(marginPct, minMarginPct)

      await db.product.update({
        where: { id: product.id },
        data: {
          cost: adjusted.newCost,
          salePrice,
          isMarginAlert: isAlert,
        },
      })
      await db.priceHistory.create({
        data: {
          productId: product.id,
          cost: adjusted.newCost,
          marginPct,
          salePrice,
          changeReason: 'BCRA_RATE',
          ipcReference: variationPct,
          note: 'Variación USD oficial (BCRA)',
          recordedAt: now,
        },
      })
    }
  })

  if (products.length > 0) {
    await prisma.local.update({
      where: { id: localId },
      data: { lastUsdAppliedPeriod: usdPeriod },
    })
  }

  return {
    updated: products.length,
    appliedUsdPct: variationPct,
    breakdown,
  }
}
