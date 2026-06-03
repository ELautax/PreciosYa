export type MarginStatusLevel = 'LOW' | 'WARNING' | 'OK'

export type ProductDto = {
  id: string
  localId: string
  categoryId: string | null
  categoryName?: string | null
  categoryPreferredIndex?: string | null
  name: string
  barcode: string | null
  unit: string
  cost: number
  marginPct: number
  salePrice: number
  isMarginAlert: boolean
  marginStatus: MarginStatusLevel
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ProductHistoryEntryDto = {
  id: string
  cost: number
  marginPct: number
  salePrice: number
  changeReason: string
  ipcReference: number | null
  note: string | null
  recordedAt: string
}
