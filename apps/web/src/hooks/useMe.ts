import { useQuery } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import type { AppUser } from '@/types/appUser'

export function useMe() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ user: AppUser }>>('/api/auth/me')
      return res.data.data.user
    },
  })
}
