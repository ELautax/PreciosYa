import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import type { LocalDto } from '@/types/local'

export function useLocals() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['locals'],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ locals: LocalDto[] }>>('/api/locals')
      return res.data.data.locals
    },
  })
}

export function useCreateLocal() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; address?: string | null }) => {
      const res = await api.post<ApiSuccess<{ local: LocalDto }>>(
        '/api/locals',
        input,
      )
      return res.data.data.local
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['locals'] })
    },
  })
}
