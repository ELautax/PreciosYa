import { useQuery } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'

type PriceListDto = {
  id: string
  localId: string
  format: 'PNG'
  fileUrl: string | null
  sharedVia: string | null
  createdAt: string
}

type LatestExport = {
  priceList: PriceListDto
  localName: string
} | null

export function useLatestExport() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['exports-latest'],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ latest: LatestExport }>>('/api/exports/latest')
      return res.data.data.latest
    },
  })
}
