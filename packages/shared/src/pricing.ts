export type IPCResult = {
  newCost: number
  previousCost: number
  appliedIpc: number
  differenceAmount: number
}

export type ProductForPricing = {
  id: string
  cost: number
  marginPct: number
}

export type ProductUpdateResult = {
  id: string
  previousCost: number
  newCost: number
  salePrice: number
}

function roundToTen(n: number): number {
  return Math.round(n / 10) * 10
}

export function calculateSalePrice(cost: number, marginPct: number): number {
  if (cost <= 0) throw new Error('cost debe ser mayor que 0')
  if (marginPct < 0) throw new Error('marginPct no puede ser negativo')
  return roundToTen(cost * (1 + marginPct / 100))
}

export function calculateMarginPct(cost: number, salePrice: number): number {
  if (cost <= 0) throw new Error('cost debe ser mayor que 0')
  return ((salePrice - cost) / cost) * 100
}

export function applyPercentageIncrease(cost: number, increasePct: number): number {
  if (cost <= 0) throw new Error('cost debe ser mayor que 0')
  const v = cost * (1 + increasePct / 100)
  return Math.round(v * 100) / 100
}

export function applyIPC(cost: number, ipcPct: number): IPCResult {
  if (cost <= 0) throw new Error('cost debe ser mayor que 0')
  const previousCost = cost
  const newCost = applyPercentageIncrease(cost, ipcPct)
  return {
    newCost,
    previousCost,
    appliedIpc: ipcPct,
    differenceAmount: Math.round((newCost - previousCost) * 100) / 100,
  }
}

export type MarginStatusLevel = 'LOW' | 'WARNING' | 'OK'

export const DEFAULT_MARGIN_WARNING_BUFFER_PCT = 5

export function getMarginStatus(
  marginPct: number,
  minMarginPct: number,
  bufferPct: number = DEFAULT_MARGIN_WARNING_BUFFER_PCT,
): MarginStatusLevel {
  if (marginPct < minMarginPct) return 'LOW'
  if (marginPct < minMarginPct + bufferPct) return 'WARNING'
  return 'OK'
}

/** Alerta crítica: margen por debajo del mínimo del local. */
export function isMarginAlert(marginPct: number, minMarginPct: number): boolean {
  return getMarginStatus(marginPct, minMarginPct) === 'LOW'
}

export function bulkUpdateCosts(
  products: ProductForPricing[],
  increasePct: number,
): ProductUpdateResult[] {
  return products.map((p) => {
    const previousCost = p.cost
    const newCost = applyPercentageIncrease(p.cost, increasePct)
    const salePrice = calculateSalePrice(newCost, p.marginPct)
    return {
      id: p.id,
      previousCost,
      newCost,
      salePrice,
    }
  })
}
