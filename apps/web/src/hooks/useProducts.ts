import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import type { ProductDto } from '@/types/product'

export type ProductListResult = {
  items: ProductDto[]
  total: number
  page: number
  limit: number
}

export function useProducts(
  localId: string | undefined,
  opts?: { search?: string; page?: number; limit?: number; isAlert?: boolean },
) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['products', localId, opts],
    enabled: Boolean(localId),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<ProductListResult>>('/api/products', {
        params: {
          localId,
          search: opts?.search || undefined,
          page: opts?.page,
          limit: opts?.limit ?? 20,
          ...(opts?.isAlert ? { isAlert: 'true' as const } : {}),
        },
      })
      return res.data.data
    },
  })
}

export function useCreateProduct() {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      localId: string
      name: string
      unit?: string
      barcode?: string | null
      cost: number
      marginPct: number
      notes?: string | null
    }) => {
      const res = await api.post<ApiSuccess<{ product: ProductDto }>>(
        '/api/products',
        body,
      )
      return res.data.data.product
    },
    onSuccess: (_, variables) => {
      void qc.invalidateQueries({ queryKey: ['products', variables.localId] })
    },
  })
}

export function useUpdateProduct(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      body: Partial<{
        name: string
        unit: string
        barcode: string | null
        cost: number
        marginPct: number
        notes: string | null
      }>
    }) => {
      const res = await api.put<ApiSuccess<{ product: ProductDto }>>(
        `/api/products/${input.id}`,
        input.body,
      )
      return res.data.data.product
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products', localId] })
    },
  })
}

export function useDeleteProduct(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete<ApiSuccess<{ ok: boolean }>>(`/api/products/${id}`)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products', localId] })
    },
  })
}
