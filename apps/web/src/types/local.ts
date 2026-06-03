export type LocalDto = {
  id: string
  userId: string
  name: string
  address: string | null
  minMarginPct: number
  currency: string
  lastIpcAppliedPeriod: string | null
  lastUsdAppliedPeriod: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}
