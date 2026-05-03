import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'

type AdminUser = {
  id: string
  email: string
  name: string
  plan: 'FREE' | 'PRO' | 'AGENCY'
  planExpiresAt: string | null
  createdAt: string
}

export function useAdminUsers(page = 1, search = '') {
  const api = useApiClient()
  return useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const res = await api.get<
        ApiSuccess<{ items: AdminUser[]; total: number; page: number; limit: number }>
      >('/api/admin/users', {
        params: { page, search: search || undefined },
      })
      return res.data.data
    },
  })
}

export function useAdminStats() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get<
        ApiSuccess<{ stats: { users: number; locals: number; products: number; alerts: number } }>
      >('/api/admin/stats')
      return res.data.data.stats
    },
  })
}

export function useAdminIndices() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['admin-indices'],
    queryFn: async () => {
      const res = await api.get<
        ApiSuccess<{
          indices: Array<{
            id: string
            type: string
            period: string
            valuePct: number
            sourceUrl: string | null
            fetchedAt: string
          }>
        }>
      >('/api/admin/indices')
      return res.data.data.indices
    },
  })
}

export function useAdminUpdatePlan() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { userId: string; plan: 'FREE' | 'PRO' | 'AGENCY' }) => {
      const res = await api.put<ApiSuccess<{ user: AdminUser }>>(
        `/api/admin/users/${input.userId}/plan`,
        {
          plan: input.plan,
        },
      )
      return res.data.data.user
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-users'] })
      void qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export function useAdminForceFetchIpc() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiSuccess<{ ipc: { period: string; valuePct: number } }>>(
        '/api/admin/ipc/force-fetch',
      )
      return res.data.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-indices'] })
      void qc.invalidateQueries({ queryKey: ['ipc-latest'] })
    },
  })
}
