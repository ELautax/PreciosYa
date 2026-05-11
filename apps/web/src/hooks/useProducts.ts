import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import {
  enqueueOfflineOperation,
  isOfflineQueued,
  markOfflineQueued,
  readOfflineSnapshot,
  saveOfflineSnapshot,
} from '@/lib/offline'
import { appToast } from '@/lib/toast'
import type { ProductDto, ProductHistoryEntryDto } from '@/types/product'

export type CsvImportResult = {
  imported: number
  errors: { line: number; message: string }[]
}

export type ProductListResult = {
  items: ProductDto[]
  total: number
  page: number
  limit: number
}

export function useProducts(
  localId: string | undefined,
  opts?: {
    search?: string
    page?: number
    limit?: number
    isAlert?: boolean
    categoryId?: string
  },
) {
  const api = useApiClient()
  const snapshotKey = `products:${localId ?? 'none'}:${opts?.categoryId ?? ''}:${opts?.search ?? ''}`
  return useQuery({
    queryKey: ['products', localId, opts],
    enabled: Boolean(localId),
    queryFn: async () => {
      try {
        const res = await api.get<ApiSuccess<ProductListResult>>('/api/products', {
          params: {
            localId,
            search: opts?.search || undefined,
            page: opts?.page,
            limit: opts?.limit ?? 20,
            ...(opts?.isAlert ? { isAlert: 'true' as const } : {}),
            ...(opts?.categoryId ? { categoryId: opts.categoryId } : {}),
          },
        })
        const data = res.data.data
        void saveOfflineSnapshot(snapshotKey, data)
        return data
      } catch (error) {
        const cached = await readOfflineSnapshot<ProductListResult>(snapshotKey)
        if (cached) return cached
        throw error
      }
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
      categoryId?: string | null
      notes?: string | null
    }) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await enqueueOfflineOperation({ kind: 'product:create', payload: body })
        return markOfflineQueued()
      }
      const res = await api.post<ApiSuccess<{ product: ProductDto }>>(
        '/api/products',
        body,
      )
      return res.data.data.product
    },
    onSuccess: (data, variables) => {
      if (isOfflineQueued(data)) {
        appToast.info(
          'Sin conexión: el producto se creará cuando vuelva la conexión (en orden).',
        )
        return
      }
      void qc.invalidateQueries({ queryKey: ['products', variables.localId] })
      appToast.success('Producto guardado')
    },
    onError: () => {
      appToast.error('No se pudo guardar el producto')
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
        categoryId: string | null
        notes: string | null
      }>
    }) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await enqueueOfflineOperation({
          kind: 'product:update',
          payload: { localId, productId: input.id, body: input.body },
        })
        return markOfflineQueued()
      }
      const res = await api.put<ApiSuccess<{ product: ProductDto }>>(
        `/api/products/${input.id}`,
        input.body,
      )
      return res.data.data.product
    },
    onSuccess: (data) => {
      if (isOfflineQueued(data)) {
        appToast.info(
          'Sin conexión: la actualización se enviará cuando vuelva la conexión (en orden).',
        )
        return
      }
      void qc.invalidateQueries({ queryKey: ['products', localId] })
      appToast.success('Producto actualizado')
    },
    onError: () => {
      appToast.error('No se pudo actualizar el producto')
    },
  })
}

export function useDeleteProduct(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await enqueueOfflineOperation({
          kind: 'product:delete',
          payload: { localId, productId: id },
        })
        return markOfflineQueued()
      }
      await api.delete<ApiSuccess<{ ok: boolean }>>(`/api/products/${id}`)
    },
    onSuccess: (data) => {
      if (isOfflineQueued(data)) {
        appToast.info(
          'Sin conexión: la baja se enviará cuando vuelva la conexión (en orden).',
        )
        return
      }
      void qc.invalidateQueries({ queryKey: ['products', localId] })
      appToast.success('Producto dado de baja')
    },
    onError: () => {
      appToast.error('No se pudo dar de baja el producto')
    },
  })
}

export function useProductHistory(productId: string | undefined) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['product-history', productId],
    enabled: Boolean(productId),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ history: ProductHistoryEntryDto[] }>>(
        `/api/products/${productId}/history`,
      )
      return res.data.data.history
    },
  })
}

export function useBulkUpdate(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      localId: string
      increasePct: number
      categoryId?: string
    }) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await enqueueOfflineOperation({
          kind: 'product:bulk',
          payload: {
            localId: input.localId,
            increasePct: input.increasePct,
            ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          },
        })
        return markOfflineQueued()
      }
      const res = await api.put<ApiSuccess<{ updated: number }>>(
        '/api/products/bulk-update',
        input,
      )
      return res.data.data
    },
    onSuccess: (data) => {
      if (isOfflineQueued(data)) {
        appToast.info(
          'Sin conexión: la actualización masiva se enviará al reconectar (en orden).',
        )
        return
      }
      void qc.invalidateQueries({ queryKey: ['products', localId] })
      appToast.success('Actualización masiva aplicada')
    },
    onError: () => {
      appToast.error('No se pudo aplicar la actualización masiva')
    },
  })
}

export function useImportProductsCsv(localId: string) {
  const api = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (csv: string): Promise<CsvImportResult> => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('IMPORT_OFFLINE')
      }
      const res = await api.post<
        ApiSuccess<{ imported: number; errors: { line: number; message: string }[] }>
      >('/api/products/import-csv', { localId, csv })
      return res.data.data
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['products', localId] })
      if (data.errors.length === 0) {
        appToast.success(
          data.imported === 1 ? 'Importamos 1 producto' : `Importamos ${data.imported} productos`,
        )
      } else if (data.imported > 0) {
        appToast.info(
          `Importamos ${data.imported} producto${data.imported === 1 ? '' : 's'} con ${data.errors.length} línea${data.errors.length === 1 ? '' : 's'} con errores.`,
        )
      }
    },
    onError: (err: AxiosError<{ success?: boolean; message?: string }> | Error) => {
      if (err.message === 'IMPORT_OFFLINE') {
        appToast.error('Para importar un CSV necesitás conexión.')
        return
      }
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object'
          ? (err.response.data as { message?: string }).message
          : undefined
      appToast.error(msg ?? 'No se pudo importar el archivo')
    },
  })
}