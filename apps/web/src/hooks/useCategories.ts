import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import { appToast } from '@/lib/toast'
import type { CategoryDto } from '@/types/category'

type UseCategoriesOptions = {
  /** Si true, refetch al montar (p. ej. modal Nuevo producto tras activar rubros). */
  refetchOnMount?: boolean
}

export function useCategories(
  localId: string | undefined,
  activeOnly = false,
  options?: UseCategoriesOptions,
) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['categories', localId, activeOnly],
    enabled: Boolean(localId),
    staleTime: options?.refetchOnMount ? 0 : 30_000,
    refetchOnMount: options?.refetchOnMount ? 'always' : true,
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ categories: CategoryDto[] }>>(
        '/api/categories',
        { params: { localId } },
      )
      const list = res.data.data.categories
      return activeOnly ? list.filter((c) => c.isActive) : list
    },
  })
}

export function usePatchCategory(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      isActive?: boolean
      indexByUsd?: boolean
    }) => {
      const body: { isActive?: boolean; indexByUsd?: boolean } = {}
      if (input.isActive !== undefined) body.isActive = input.isActive
      if (input.indexByUsd !== undefined) body.indexByUsd = input.indexByUsd
      const res = await api.patch<ApiSuccess<{ category: CategoryDto }>>(
        `/api/categories/${input.id}`,
        body,
      )
      return res.data.data.category
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories', localId] })
      void qc.invalidateQueries({ queryKey: ['locals-ipc-breakdown', localId] })
      void qc.invalidateQueries({ queryKey: ['locals-usd-breakdown', localId] })
      appToast.success('Rubro actualizado')
    },
    onError: () => {
      appToast.error('No se pudo actualizar el rubro')
    },
  })
}

/** @deprecated Usar usePatchCategory */
export function usePatchCategoryActive(localId: string) {
  const mut = usePatchCategory(localId)
  return {
    ...mut,
    mutateAsync: (input: { id: string; isActive: boolean }) =>
      mut.mutateAsync({ id: input.id, isActive: input.isActive }),
  }
}
