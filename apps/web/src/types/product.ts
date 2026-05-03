export type ProductDto = {
  id: string
  localId: string
  categoryId: string | null
  name: string
  barcode: string | null
  unit: string
  cost: number
  marginPct: number
  salePrice: number
  isMarginAlert: boolean
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}
