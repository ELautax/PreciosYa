import { useQuery } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'

type EconomicIndexDto = {
  id: string
  type: string
  period: string
  valuePct: number
  usdRateArs?: number | null
  sourceUrl: string | null
  fetchedAt: string
}

export function useIpcLatest() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['ipc-latest'],
    staleTime: 60_000,
    refetchOnMount: 'always',
    queryFn: async () => {
      const res = await api.get<
        ApiSuccess<{ ipc: EconomicIndexDto | null; bcra: EconomicIndexDto | null }>
      >('/api/ipc/latest')
      return res.data.data
    },
  })
}

export function useIpcHistory() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['ipc-history'],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ indices: EconomicIndexDto[] }>>('/api/ipc/history')
      return res.data.data.indices
    },
  })
}
