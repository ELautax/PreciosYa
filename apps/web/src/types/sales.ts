import type { SalesPeriod } from 'shared'

export type SaleLineDto = {
  id: string
  productId: string
  productName: string
  productUnit: string
  productBarcode: string | null
  quantity: number
  unitSalePrice: number
  unitCostSnapshot: number
  lineRevenue: number
  lineProfit: number
}

export type SaleDto = {
  id: string
  localId: string
  soldAt: string
  note: string | null
  createdAt: string
  updatedAt: string
  totalRevenue: number
  totalProfit: number
  unitsSold: number
  lines: SaleLineDto[]
}

export type SaleListResult = {
  items: SaleDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type SalesDashboardDto = {
  period: SalesPeriod
  from: string
  to: string
  salesToday: number
  salesMonth: number
  profitMonth: number | null
  unitsSold: number
  averageTicket: number
  totalRevenue: number
  totalProfit: number | null
  saleCount: number
  revenueTrend: { date: string; revenue: number; profit: number }[]
  profitTrend: { date: string; revenue: number; profit: number }[]
  categoryBreakdown: {
    categoryId: string | null
    categoryName: string
    revenue: number
    profit: number
    units: number
  }[]
}

export type TopProductsDto = {
  byUnits: {
    productId: string
    productName: string
    units: number
    revenue: number
    profit: number
  }[]
  byProfit: {
    productId: string
    productName: string
    units: number
    revenue: number
    profit: number
  }[]
}

export type StagnantProductsDto = {
  stagnantDays: number
  items: {
    productId: string
    productName: string
    lastSaleAt: string | null
    daysSinceLastSale: number | null
    isStagnant: boolean
  }[]
}

export type PromoteProductsDto = {
  items: {
    productId: string
    productName: string
    units: number
    marginPct: number
    profit: number
    reason: string
  }[]
}

export type StarProductsDto = {
  items: {
    productId: string
    productName: string
    units: number
    marginPct: number
    profit: number
    badge: 'Producto estrella'
  }[]
}

export type CategoryPerformanceDto = {
  items: {
    categoryId: string | null
    categoryName: string
    colorHex: string | null
    revenue: number
    profit: number
    units: number
  }[]
}

export type CreateSalePayload = {
  localId: string
  soldAt?: string
  note?: string | null
  items: { productId: string; quantity: number }[]
}

export type SaleDraftItem = {
  productId: string
  name: string
  unit: string
  salePrice: number
  quantity: number
}
