import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiSuccess, SalesPeriod } from 'shared'

import { dateInputToIsoEnd, dateInputToIsoStart } from '@/components/sales/format'
import { useApiClient } from '@/hooks/useApiClient'
import { appToast } from '@/lib/toast'
import type {
  CategoryPerformanceDto,
  CreateSalePayload,
  PromoteProductsDto,
  SaleDto,
  SaleListResult,
  SalesDashboardDto,
  StagnantProductsDto,
  StarProductsDto,
  TopProductsDto,
} from '@/types/sales'

type PeriodParams = {
  localId: string | undefined
  period?: SalesPeriod
  /** Valores de input type=date (YYYY-MM-DD) cuando period=custom */
  from?: string
  to?: string
  enabled?: boolean
}

function periodParams(p: PeriodParams) {
  const period = p.period ?? '7d'
  const base = {
    localId: p.localId,
    period,
  }

  if (period === 'custom' && p.from && p.to) {
    return {
      ...base,
      from: dateInputToIsoStart(p.from),
      to: dateInputToIsoEnd(p.to),
    }
  }

  return base
}

function isPeriodQueryReady(p: PeriodParams): boolean {
  if (!p.localId) return false
  if (p.enabled === false) return false
  if (p.period === 'custom') return Boolean(p.from && p.to)
  return true
}

export function useSalesList(
  localId: string | undefined,
  opts?: { from?: string; to?: string; page?: number; limit?: number },
) {
  const api = useApiClient()
  const page = opts?.page ?? 1
  const limit = opts?.limit ?? 20

  return useQuery({
    queryKey: ['sales', 'list', localId, opts?.from, opts?.to, page, limit],
    enabled: Boolean(localId),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<SaleListResult>>('/api/sales', {
        params: {
          localId,
          page,
          limit,
          ...(opts?.from ? { from: opts.from } : {}),
          ...(opts?.to ? { to: opts.to } : {}),
        },
      })
      return res.data.data
    },
  })
}

export function useSaleDetail(saleId: string | undefined) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['sales', 'detail', saleId],
    enabled: Boolean(saleId),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<{ sale: SaleDto }>>(`/api/sales/${saleId}`)
      return res.data.data.sale
    },
  })
}

export function useSalesDashboard(params: PeriodParams) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['sales', 'dashboard', params.localId, params.period, params.from, params.to],
    enabled: isPeriodQueryReady(params),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<SalesDashboardDto>>('/api/sales/dashboard', {
        params: periodParams(params),
      })
      return res.data.data
    },
  })
}

export function useTopProducts(params: PeriodParams) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['sales', 'top-products', params.localId, params.period, params.from, params.to],
    enabled: isPeriodQueryReady(params),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<TopProductsDto>>('/api/sales/top-products', {
        params: periodParams(params),
      })
      return res.data.data
    },
  })
}

export function useStagnantProducts(localId: string | undefined, enabled = true) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['sales', 'stagnant', localId],
    enabled: Boolean(localId) && enabled,
    queryFn: async () => {
      const res = await api.get<ApiSuccess<StagnantProductsDto>>('/api/sales/stagnant-products', {
        params: { localId },
      })
      return res.data.data
    },
  })
}

export function usePromoteProducts(params: PeriodParams) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['sales', 'promote', params.localId, params.period, params.from, params.to],
    enabled: isPeriodQueryReady(params),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<PromoteProductsDto>>('/api/sales/promote-products', {
        params: periodParams(params),
      })
      return res.data.data
    },
  })
}

export function useStarProducts(params: PeriodParams) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['sales', 'star', params.localId, params.period, params.from, params.to],
    enabled: isPeriodQueryReady(params),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<StarProductsDto>>('/api/sales/star-products', {
        params: periodParams(params),
      })
      return res.data.data
    },
  })
}

export function useCategoryPerformance(params: PeriodParams) {
  const api = useApiClient()
  return useQuery({
    queryKey: ['sales', 'category-performance', params.localId, params.period, params.from, params.to],
    enabled: isPeriodQueryReady(params),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<CategoryPerformanceDto>>(
        '/api/sales/category-performance',
        { params: periodParams(params) },
      )
      return res.data.data
    },
  })
}

export function useCreateSale(localId: string | undefined) {
  const api = useApiClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Omit<CreateSalePayload, 'localId'>) => {
      if (!localId) throw new Error('localId requerido')
      const res = await api.post<ApiSuccess<{ sale: SaleDto }>>('/api/sales', {
        localId,
        ...payload,
      })
      return res.data.data.sale
    },
    onSuccess: () => {
      appToast.success('Venta registrada')
      void qc.invalidateQueries({ queryKey: ['sales'] })
    },
    onError: () => {
      appToast.error('No pudimos registrar la venta')
    },
  })
}
