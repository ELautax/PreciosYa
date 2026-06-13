/**
 * Cálculos comerciales puros para líneas de venta (sin IVA ni redondeo fiscal).
 */

export function lineRevenue(unitSalePrice: number, quantity: number): number {
  if (!Number.isFinite(unitSalePrice) || !Number.isFinite(quantity)) {
    throw new Error('unitSalePrice y quantity deben ser números finitos')
  }
  if (unitSalePrice < 0 || quantity <= 0) {
    throw new Error('unitSalePrice no puede ser negativo y quantity debe ser positiva')
  }
  return Math.round(unitSalePrice * quantity * 100) / 100
}

export function lineProfit(
  unitSalePrice: number,
  unitCostSnapshot: number,
  quantity: number,
): number {
  if (!Number.isFinite(unitCostSnapshot)) {
    throw new Error('unitCostSnapshot debe ser un número finito')
  }
  const revenue = lineRevenue(unitSalePrice, quantity)
  const costTotal = Math.round(unitCostSnapshot * quantity * 100) / 100
  return Math.round((revenue - costTotal) * 100) / 100
}

export function averageTicket(totalRevenue: number, saleCount: number): number {
  if (!Number.isFinite(totalRevenue) || !Number.isFinite(saleCount)) {
    throw new Error('totalRevenue y saleCount deben ser números finitos')
  }
  if (saleCount <= 0) return 0
  if (totalRevenue < 0) {
    throw new Error('totalRevenue no puede ser negativo')
  }
  return Math.round((totalRevenue / saleCount) * 100) / 100
}

export function lineMarginPct(unitSalePrice: number, unitCostSnapshot: number): number {
  if (unitCostSnapshot <= 0) return 0
  return Math.round(((unitSalePrice - unitCostSnapshot) / unitCostSnapshot) * 10000) / 100
}

export type SalesPeriod =
  | 'today'
  | '7d'
  | '30d'
  | '90d'
  | 'month'
  | 'custom'

export const FREE_SALES_HISTORY_DAYS = 7

export const FREE_SALES_PERIODS: SalesPeriod[] = ['today', '7d']

export const PRO_SALES_PERIODS: SalesPeriod[] = [
  'today',
  '7d',
  '30d',
  '90d',
  'month',
  'custom',
]
