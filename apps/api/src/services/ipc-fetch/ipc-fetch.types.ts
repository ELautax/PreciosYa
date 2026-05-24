import type { IndexType } from '@prisma/client'

export type FetchedIpcRow = {
  indexType: IndexType
  period: Date
  valuePct: number
  sourceUrl: string
}
