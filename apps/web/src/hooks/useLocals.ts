import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import { appToast } from '@/lib/toast'
import type { LocalDto } from '@/types/local'

const LOCALS_CACHE_KEY = 'preciosya:locals-cache'

function readLocalsCache(): LocalDto[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOCALS_CACHE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as LocalDto[]) : null
  } catch {
    return null
  }
}

function writeLocalsCache(locals: LocalDto[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LOCALS_CACHE_KEY, JSON.stringify(locals))
  } catch {
    /* quota / private mode */
  }
}

export function useLocals() {
  const api = useApiClient()
  return useQuery({
    queryKey: ['locals'],
    queryFn: async () => {
      try {
        const res = await api.get<ApiSuccess<{ locals: LocalDto[] }>>('/api/locals')
        const locals = res.data.data.locals
        writeLocalsCache(locals)
        return locals
      } catch (error) {
        const cached = readLocalsCache()
        if (cached && cached.length > 0) {
          return cached
        }
        throw error
      }
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
            requestedIndexType: string
            appliedIndexType: string
            usedGeneralFallback?: boolean
            ipcPct: number
            productCount: number
          }>
        }>
      >(`/api/locals/${localId}/ipc-breakdown`)
      return res.data.data
    },
  })
}
