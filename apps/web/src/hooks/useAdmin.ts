import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import { appToast } from '@/lib/toast'

function apiErrorStatus(err: unknown): number | undefined {
  if (axios.isAxiosError(err)) return err.response?.status
  return undefined
}

type AdminUser = {
  id: string
  email: string
  name: string
  plan: 'FREE' | 'PRO' | 'AGENCY'
  planExpiresAt: string | null
  createdAt: string
}

export function useApiHealth() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const res = await api.get<
        ApiSuccess<{
          status: string
          version?: string
          ipcManualRoute?: boolean
          gitCommit?: string | null
        }>
      >('/health')
      return res.data.data
    },
    staleTime: 60_000,
  })
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
      appToast.success('Plan actualizado')
    },
    onError: () => {
      appToast.error('No se pudo actualizar el plan')
    },
  })
}

type ForceFetchIpcPayload = {
  period: string
  valuePct: number
  source?: 'alphacast' | 'argly' | 'none'
  warning?: string
  seriesUpdated?: number
  indices?: Array<{ type: string; period: string; valuePct: number }>
}

export function useAdminForceFetchIpc() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiSuccess<{ ipc: ForceFetchIpcPayload }>>(
        '/api/admin/ipc/force-fetch',
      )
      return res.data.data.ipc
    },
    onSuccess: (ipc) => {
      void qc.invalidateQueries({ queryKey: ['admin-indices'] })
      void qc.invalidateQueries({ queryKey: ['ipc-latest'] })
      void qc.invalidateQueries({ queryKey: ['ipc-history'] })
      const month = new Date(ipc.period).toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      })
      const seriesCount = ipc.seriesUpdated ?? ipc.indices?.length
      const seriesLabel =
        seriesCount !== undefined ? `${seriesCount} series` : 'sincronizado'
      if (ipc.warning) {
        appToast.info(ipc.warning)
      } else {
        appToast.success(`IPC ${ipc.valuePct.toFixed(2)}% (${month}, ${seriesLabel})`)
      }
    },
    onError: (err) => {
      if (apiErrorStatus(err) === 404) {
        appToast.error('Ruta IPC no encontrada en el API. Redeploy Railway (rama Trincheras).')
        return
      }
      appToast.error('No se pudo sincronizar IPC. Revisá ALPHACAST_API_KEY en Railway.')
    },
  })
}

export function useAdminManualIpc() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      period: string
      indices: Array<{ type: string; valuePct: number }>
    }) => {
      const res = await api.post<
        ApiSuccess<{ period: string; count: number; indices: unknown[] }>
      >('/api/admin/ipc/manual', input)
      return res.data.data
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['admin-indices'] })
      void qc.invalidateQueries({ queryKey: ['ipc-latest'] })
      void qc.invalidateQueries({ queryKey: ['ipc-history'] })
      const month = new Date(data.period).toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      })
      appToast.success(`IPC manual guardado (${month}, ${data.count} series)`)
    },
    onError: (err) => {
      if (apiErrorStatus(err) === 404) {
        appToast.error(
          'IPC manual no disponible: el API en Railway está desactualizado. Settings → Redeploy en rama Trincheras (commit con /ipc/manual).',
        )
        return
      }
      appToast.error('No se pudo guardar el IPC manual')
    },
  })
}
