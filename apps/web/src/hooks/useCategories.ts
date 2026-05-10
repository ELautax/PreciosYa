import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import { appToast } from '@/lib/toast'
import type { CategoryDto } from '@/types/category'

export function useCategories(localId: string | undefined) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['categories', localId],
    enabled: Boolean(localId),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ categories: CategoryDto[] }>>(
        '/api/categories',
        { params: { localId } },
      )
      return res.data.data.categories
    },
  })
}

export function useCreateCategory(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      name: string
      colorHex?: string | null
      preferredIndex?: 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS'
    }) => {
      const res = await api.post<ApiSuccess<{ category: CategoryDto }>>(
        '/api/categories',
        { localId, ...input },
      )
      return res.data.data.category
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories', localId] })
      appToast.success('Categoría guardada')
    },
    onError: () => {
      appToast.error('No se pudo guardar la categoría')
    },
  })
}

export function useUpdateCategory(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      body: {
        name?: string
        colorHex?: string | null
        preferredIndex?: 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS'
      }
    }) => {
      const res = await api.put<ApiSuccess<{ category: CategoryDto }>>(
        `/api/categories/${input.id}`,
        input.body,
      )
      return res.data.data.category
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories', localId] })
      appToast.success('Categoría actualizada')
    },
    onError: () => {
      appToast.error('No se pudo actualizar la categoría')
    },
  })
}

export function useDeleteCategory(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete<ApiSuccess<{ ok: boolean }>>(`/api/categories/${id}`)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories', localId] })
      void qc.invalidateQueries({ queryKey: ['products', localId] })
      appToast.success('Categoría eliminada')
    },
    onError: () => {
      appToast.error('No se pudo eliminar la categoría')
    },
  })
}
