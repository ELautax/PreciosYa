import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/contexts/AuthContext'
import { useApiClient } from '@/hooks/useApiClient'

export type SubscriptionStatus = {
  plan: 'FREE' | 'PRO' | 'AGENCY'
  planExpiresAt: string | null
  mpConfigured: boolean
  proAmountArs: number
  subscription: {
    id: string
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING'
    mpSubscriptionId: string | null
    amountArs: number
    startedAt: string
    expiresAt: string | null
  } | null
}

type CheckoutResponse = {
  preapprovalId: string
  checkoutUrl: string
  status: string
}

export function useSubscriptionStatus() {
  const api = useApiClient()
  const { session } = useAuth()
  return useQuery({
    queryKey: ['subscription', 'status'],
    enabled: Boolean(session?.access_token),
    queryFn: async () => {
      const res = await api.get<{ success: true; data: SubscriptionStatus }>(
        '/api/subscriptions/status',
      )
      return res.data.data
    },
  })
}

export function useProCheckout() {
  const api = useApiClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ success: true; data: CheckoutResponse }>(
        '/api/subscriptions/checkout',
      )
      return res.data.data
    },
  })
}

export function useSubscriptionSync() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ success: true; data: SubscriptionStatus }>(
        '/api/subscriptions/sync',
      )
      return res.data.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['subscription', 'status'] })
    },
  })
}
