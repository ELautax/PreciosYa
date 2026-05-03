import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useAuth } from '@/contexts/AuthContext'
import { useApiClient } from '@/hooks/useApiClient'
import { supabase } from '@/lib/supabase'
import type { NotificationDto } from '@/types/notification'

type NotificationsResponse = {
  items: NotificationDto[]
  total: number
  page: number
  limit: number
}

export function useNotifications(page = 1) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<NotificationsResponse>>('/api/notifications', {
        params: { page, limit: 20 },
      })
      return res.data.data
    },
  })
}

export function useUnreadNotificationsCount() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ count: number }>>(
        '/api/notifications/unread-count',
      )
      return res.data.data.count
    },
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationRead() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.put<ApiSuccess<{ ok: boolean }>>(`/api/notifications/${id}/read`)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] })
      void qc.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.put<ApiSuccess<{ updated: number }>>('/api/notifications/read-all')
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] })
      void qc.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

export function useNotificationsRealtimeSync() {
  const qc = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  useEffect(() => {
    if (!supabase || !userId) return
    const sb = supabase

    const channel = sb
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void qc.invalidateQueries({ queryKey: ['notifications'] })
          void qc.invalidateQueries({ queryKey: ['notifications-unread'] })
        },
      )
      .subscribe()

    return () => {
      void sb.removeChannel(channel)
    }
  }, [qc, userId])
}
