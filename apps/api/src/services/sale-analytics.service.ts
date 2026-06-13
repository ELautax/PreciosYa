import type { PlanType } from '@prisma/client'
import {
  FREE_SALES_PERIODS,
  PRO_SALES_PERIODS,
  type SalesPeriod,
  averageTicket,
  lineProfit,
  lineRevenue,
} from 'shared'

import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/AppError.js'
import {
  argentinaDateKey,
  endOfArgentinaDay,
  resolvePeriodBounds,
  startOfArgentinaDay,
  startOfArgentinaMonth,
} from '../utils/argentinaTime.js'
import { assertSalesLocalAccess, fetchSaleLinesInRange } from './sale.service.js'

const STAGNANT_DAYS_DEFAULT = 30
const PROMOTE_MARGIN_PCT_MIN = 25
const TOP_LIMIT = 10

function toNum(d: { toNumber(): number } | number): number {
  return typeof d === 'number' ? d : d.toNumber()
}

export function assertPeriodAllowed(plan: PlanType, period: SalesPeriod): void {
  const allowed = plan === 'FREE' ? FREE_SALES_PERIODS : PRO_SALES_PERIODS
  if (!allowed.includes(period)) {
    throw new AppError({
      statusCode: 403,
      message: 'Tu plan no permite este período de análisis',
      code: 'PLAN_REQUIRED',
    })
  }
}

type LineRow = Awaited<ReturnType<typeof fetchSaleLinesInRange>>[number]

function aggregateLines(lines: LineRow[]) {
  let totalRevenue = 0
  let totalProfit = 0
  let unitsSold = 0
  const saleIds = new Set<string>()

  for (const line of lines) {
    const qty = toNum(line.quantity)
    const price = toNum(line.unitSalePrice)
    const cost = toNum(line.unitCostSnapshot)
    totalRevenue += lineRevenue(price, qty)
    totalProfit += lineProfit(price, cost, qty)
    unitsSold += qty
    saleIds.add(line.sale.id)
  }

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    unitsSold,
    saleCount: saleIds.size,
    averageTicket: averageTicket(totalRevenue, saleIds.size),
  }
}

function dailySeries(lines: LineRow[], days: number) {
  const buckets = new Map<string, { revenue: number; profit: number }>()
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    buckets.set(argentinaDateKey(d), { revenue: 0, profit: 0 })
  }

  for (const line of lines) {
    const key = argentinaDateKey(line.sale.soldAt)
    if (!buckets.has(key)) continue
    const qty = toNum(line.quantity)
    const price = toNum(line.unitSalePrice)
    const cost = toNum(line.unitCostSnapshot)
    const b = buckets.get(key)!
    b.revenue += lineRevenue(price, qty)
    b.profit += lineProfit(price, cost, qty)
  }

  return [...buckets.entries()].map(([date, v]) => ({
    date,
    revenue: Math.round(v.revenue * 100) / 100,
    profit: Math.round(v.profit * 100) / 100,
  }))
}

export async function getSalesDashboard(
  userId: string,
  plan: PlanType,
  localId: string,
  period: SalesPeriod,
  customFrom?: Date,
  customTo?: Date,
) {
  await assertSalesLocalAccess(userId, localId)
  assertPeriodAllowed(plan, period)

  const { from, to } = resolvePeriodBounds(period, customFrom, customTo)
  const lines = await fetchSaleLinesInRange(localId, from, to)
  const agg = aggregateLines(lines)

  const todayFrom = startOfArgentinaDay()
  const todayTo = endOfArgentinaDay()
  const todayLines = await fetchSaleLinesInRange(localId, todayFrom, todayTo)
  const todayAgg = aggregateLines(todayLines)

  const monthFrom = startOfArgentinaMonth()
  const monthLines = await fetchSaleLinesInRange(localId, monthFrom, to)
  const monthAgg = aggregateLines(monthLines)

  const trendDays = period === 'today' ? 7 : period === '7d' ? 7 : 30
  const trendFrom = new Date(to.getTime() - trendDays * 24 * 60 * 60 * 1000)
  const trendLines = await fetchSaleLinesInRange(localId, trendFrom, to)

  const byCategory = new Map<
    string,
    { categoryId: string | null; name: string; revenue: number; profit: number; units: number }
  >()
  for (const line of lines) {
    const catId = line.product.categoryId
    const key = catId ?? '__none__'
    const name = line.product.category?.name ?? 'Sin rubro'
    const existing = byCategory.get(key) ?? {
      categoryId: catId,
      name,
      revenue: 0,
      profit: 0,
      units: 0,
    }
    const qty = toNum(line.quantity)
    const price = toNum(line.unitSalePrice)
    const cost = toNum(line.unitCostSnapshot)
    existing.revenue += lineRevenue(price, qty)
    existing.profit += lineProfit(price, cost, qty)
    existing.units += qty
    byCategory.set(key, existing)
  }

  return {
    period,
    from: from.toISOString(),
    to: to.toISOString(),
    salesToday: todayAgg.totalRevenue,
    salesMonth: monthAgg.totalRevenue,
    profitMonth: plan === 'FREE' ? null : monthAgg.totalProfit,
    unitsSold: agg.unitsSold,
    averageTicket: agg.averageTicket,
    totalRevenue: agg.totalRevenue,
    totalProfit: plan === 'FREE' ? null : agg.totalProfit,
    saleCount: agg.saleCount,
    revenueTrend: dailySeries(trendLines, trendDays),
    profitTrend: plan === 'FREE' ? [] : dailySeries(trendLines, trendDays),
    categoryBreakdown: [...byCategory.values()]
      .map((c) => ({
        categoryId: c.categoryId,
        categoryName: c.name,
        revenue: Math.round(c.revenue * 100) / 100,
        profit: Math.round(c.profit * 100) / 100,
        units: c.units,
      }))
      .sort((a, b) => b.revenue - a.revenue),
  }
}

export async function getTopProducts(
  userId: string,
  localId: string,
  period: SalesPeriod,
  customFrom?: Date,
  customTo?: Date,
) {
  await assertSalesLocalAccess(userId, localId)
  const { from, to } = resolvePeriodBounds(period, customFrom, customTo)
  const lines = await fetchSaleLinesInRange(localId, from, to)

  const byProduct = new Map<
    string,
    {
      productId: string
      productName: string
      units: number
      revenue: number
      profit: number
    }
  >()

  for (const line of lines) {
    const qty = toNum(line.quantity)
    const price = toNum(line.unitSalePrice)
    const cost = toNum(line.unitCostSnapshot)
    const existing = byProduct.get(line.productId) ?? {
      productId: line.productId,
      productName: line.product.name,
      units: 0,
      revenue: 0,
      profit: 0,
    }
    existing.units += qty
    existing.revenue += lineRevenue(price, qty)
    existing.profit += lineProfit(price, cost, qty)
    byProduct.set(line.productId, existing)
  }

  const all = [...byProduct.values()].map((p) => ({
    ...p,
    revenue: Math.round(p.revenue * 100) / 100,
    profit: Math.round(p.profit * 100) / 100,
  }))

  return {
    byUnits: [...all].sort((a, b) => b.units - a.units).slice(0, TOP_LIMIT),
    byProfit: [...all].sort((a, b) => b.profit - a.profit).slice(0, TOP_LIMIT),
  }
}

export async function getStagnantProducts(
  userId: string,
  localId: string,
  stagnantDays: number = STAGNANT_DAYS_DEFAULT,
) {
  await assertSalesLocalAccess(userId, localId)

  const cutoff = new Date(Date.now() - stagnantDays * 24 * 60 * 60 * 1000)

  const products = await prisma.product.findMany({
    where: { localId, isActive: true },
    select: {
      id: true,
      name: true,
      salePrice: true,
      cost: true,
      updatedAt: true,
    },
  })

  const lastSales = await prisma.saleLine.groupBy({
    by: ['productId'],
    where: { sale: { localId } },
    _max: { createdAt: true },
  })

  const lastMap = new Map(lastSales.map((r) => [r.productId, r._max.createdAt]))

  const stagnant = products
    .map((p) => {
      const lastSaleAt = lastMap.get(p.id) ?? null
      const daysSince =
        lastSaleAt === null
          ? null
          : Math.floor((Date.now() - lastSaleAt.getTime()) / (24 * 60 * 60 * 1000))
      const isStagnant = lastSaleAt === null || lastSaleAt < cutoff
      return {
        productId: p.id,
        productName: p.name,
        lastSaleAt: lastSaleAt?.toISOString() ?? null,
        daysSinceLastSale: daysSince,
        isStagnant,
      }
    })
    .filter((p) => p.isStagnant)
    .sort((a, b) => (b.daysSinceLastSale ?? 9999) - (a.daysSinceLastSale ?? 9999))

  return { stagnantDays, items: stagnant }
}

export async function getPromoteProducts(
  userId: string,
  localId: string,
  period: SalesPeriod,
  customFrom?: Date,
  customTo?: Date,
) {
  await assertSalesLocalAccess(userId, localId)
  const { from, to } = resolvePeriodBounds(period, customFrom, customTo)
  const lines = await fetchSaleLinesInRange(localId, from, to)

  const byProduct = new Map<
    string,
    { productId: string; productName: string; units: number; marginPct: number; profit: number }
  >()

  for (const line of lines) {
    const qty = toNum(line.quantity)
    const price = toNum(line.unitSalePrice)
    const cost = toNum(line.unitCostSnapshot)
    const marginPct = cost > 0 ? ((price - cost) / cost) * 100 : 0
    const existing = byProduct.get(line.productId) ?? {
      productId: line.productId,
      productName: line.product.name,
      units: 0,
      marginPct,
      profit: 0,
    }
    existing.units += qty
    existing.profit += lineProfit(price, cost, qty)
    existing.marginPct = marginPct
    byProduct.set(line.productId, existing)
  }

  const activeProducts = await prisma.product.findMany({
    where: { localId, isActive: true },
    select: { id: true, name: true, cost: true, salePrice: true },
  })

  const unitsList = [...byProduct.values()].map((p) => p.units)
  const medianUnits =
    unitsList.length === 0
      ? 0
      : [...unitsList].sort((a, b) => a - b)[Math.floor(unitsList.length / 2)] ?? 0

  const candidates = activeProducts
    .map((p) => {
      const sold = byProduct.get(p.id)
      const cost = toNum(p.cost)
      const price = toNum(p.salePrice)
      const marginPct = cost > 0 ? ((price - cost) / cost) * 100 : 0
      const units = sold?.units ?? 0
      return {
        productId: p.id,
        productName: p.name,
        units,
        marginPct: Math.round(marginPct * 100) / 100,
        profit: sold?.profit ?? 0,
        reason: 'Margen alto con volumen bajo o medio',
      }
    })
    .filter(
      (p) => p.marginPct >= PROMOTE_MARGIN_PCT_MIN && p.units <= Math.max(medianUnits, 1) * 1.5,
    )
    .sort((a, b) => b.marginPct - a.marginPct)
    .slice(0, TOP_LIMIT)

  return { items: candidates }
}

export async function getStarProducts(
  userId: string,
  localId: string,
  period: SalesPeriod,
  customFrom?: Date,
  customTo?: Date,
) {
  await assertSalesLocalAccess(userId, localId)
  const { from, to } = resolvePeriodBounds(period, customFrom, customTo)
  const lines = await fetchSaleLinesInRange(localId, from, to)

  const byProduct = new Map<
    string,
    {
      productId: string
      productName: string
      units: number
      marginPct: number
      profit: number
    }
  >()

  for (const line of lines) {
    const qty = toNum(line.quantity)
    const price = toNum(line.unitSalePrice)
    const cost = toNum(line.unitCostSnapshot)
    const marginPct = cost > 0 ? ((price - cost) / cost) * 100 : 0
    const existing = byProduct.get(line.productId) ?? {
      productId: line.productId,
      productName: line.product.name,
      units: 0,
      marginPct,
      profit: 0,
    }
    existing.units += qty
    existing.profit += lineProfit(price, cost, qty)
    existing.marginPct = marginPct
    byProduct.set(line.productId, existing)
  }

  const all = [...byProduct.values()]
  if (all.length === 0) return { items: [] as typeof all }

  const sortedUnits = [...all].sort((a, b) => a.units - b.units)
  const sortedMargin = [...all].sort((a, b) => a.marginPct - b.marginPct)
  const unitThreshold =
    sortedUnits[Math.floor(sortedUnits.length * 0.75)]?.units ?? 0
  const marginThreshold =
    sortedMargin[Math.floor(sortedMargin.length * 0.75)]?.marginPct ?? PROMOTE_MARGIN_PCT_MIN

  const stars = all
    .filter((p) => p.units >= unitThreshold && p.marginPct >= marginThreshold)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, TOP_LIMIT)
    .map((p) => ({ ...p, badge: 'Producto estrella' as const }))

  return { items: stars }
}

export async function getCategoryPerformance(
  userId: string,
  localId: string,
  period: SalesPeriod,
  customFrom?: Date,
  customTo?: Date,
) {
  await assertSalesLocalAccess(userId, localId)
  const { from, to } = resolvePeriodBounds(period, customFrom, customTo)
  const lines = await fetchSaleLinesInRange(localId, from, to)

  const byCategory = new Map<
    string,
    {
      categoryId: string | null
      categoryName: string
      colorHex: string | null
      revenue: number
      profit: number
      units: number
    }
  >()

  for (const line of lines) {
    const catId = line.product.categoryId
    const key = catId ?? '__none__'
    const name = line.product.category?.name ?? 'Sin rubro'
    const color = line.product.category?.colorHex ?? null
    const existing = byCategory.get(key) ?? {
      categoryId: catId,
      categoryName: name,
      colorHex: color,
      revenue: 0,
      profit: 0,
      units: 0,
    }
    const qty = toNum(line.quantity)
    const price = toNum(line.unitSalePrice)
    const cost = toNum(line.unitCostSnapshot)
    existing.revenue += lineRevenue(price, qty)
    existing.profit += lineProfit(price, cost, qty)
    existing.units += qty
    byCategory.set(key, existing)
  }

  return {
    items: [...byCategory.values()]
      .map((c) => ({
        categoryId: c.categoryId,
        categoryName: c.categoryName,
        colorHex: c.colorHex,
        revenue: Math.round(c.revenue * 100) / 100,
        profit: Math.round(c.profit * 100) / 100,
        units: c.units,
      }))
      .sort((a, b) => b.revenue - a.revenue),
  }
}
