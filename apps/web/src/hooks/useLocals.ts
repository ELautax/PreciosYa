import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import { appToast } from '@/lib/toast'
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
      appToast.success('Local guardado')
    },
    onError: () => {
      appToast.error('No se pudo guardar el local')
    },
  })
}

export function useUpdateLocal() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      body: Partial<{
        name: string
        address: string | null
        minMarginPct: number
        currency: string
      }>
    }) => {
      const res = await api.put<ApiSuccess<{ local: LocalDto }>>(
        `/api/locals/${input.id}`,
        input.body,
      )
      return res.data.data.local
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['locals'] })
      appToast.success('Local actualizado')
    },
    onError: () => {
      appToast.error('No se pudo actualizar el local')
    },
  })
}

export function useApplyIpcToLocal(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.put<
        ApiSuccess<{
          updated: number
          appliedIpcPct: number
          breakdown: Array<{
            categoryId: string | null
            categoryName: string
            requestedIndexType: string
            appliedIndexType: string
            ipcPct: number
            productCount: number
          }>
        }>
      >(`/api/locals/${localId}/apply-ipc`)
      return res.data.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products', localId] })
      void qc.invalidateQueries({ queryKey: ['ipc-latest'] })
      void qc.invalidateQueries({ queryKey: ['locals'] })
      appToast.success('IPC aplicado correctamente')
    },
    onError: () => {
      appToast.error('No se pudo aplicar el IPC')
    },
  })
}

export function useApplyUsdToLocal(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.put<
        ApiSuccess<{
          updated: number
          appliedUsdPct: number
          breakdown: Array<{
            categoryId: string
            categoryName: string
            indexType: string
            variationPct: number
            productCount: number
          }>
        }>
      >(`/api/locals/${localId}/apply-usd`)
      return res.data.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products', localId] })
      void qc.invalidateQueries({ queryKey: ['ipc-latest'] })
      void qc.invalidateQueries({ queryKey: ['locals'] })
      appToast.success('Variación USD aplicada')
    },
    onError: () => {
      appToast.error('No se pudo aplicar la variación USD')
    },
  })
}

export function useUsdBreakdownForLocal(localId: string | undefined) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['locals-usd-breakdown', localId],
    enabled: Boolean(localId),
    queryFn: async () => {
      const res = await api.get<
        ApiSuccess<{
          totalProducts: number
          variationPct: number
          usdRateArs: number | null
          period: string
          breakdown: Array<{
            categoryId: string
            categoryName: string
            indexType: string
            variationPct: number
            productCount: number
          }>
        }>
      >(`/api/locals/${localId}/usd-breakdown`)
      return res.data.data
    },
  })
}

export function useIpcBreakdownForLocal(localId: string | undefined) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['locals-ipc-breakdown', localId],
    enabled: Boolean(localId),
    queryFn: async () => {
      const res = await api.get<
        ApiSuccess<{
          totalProducts: number
          breakdown: Array<{
            categoryId: string | null
            categoryName: string
            requestedIndexType: 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS'
            appliedIndexType: 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS'
            ipcPct: number
            productCount: number
          }>
        }>
      >(`/api/locals/${localId}/ipc-breakdown`)
      return res.data.data
    },
  })
}
