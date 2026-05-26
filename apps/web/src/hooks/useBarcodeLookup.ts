import { useMutation } from '@tanstack/react-query'
import type { ApiSuccess } from 'shared'
import type { ProductUnit } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'
import { appToast } from '@/lib/toast'

export type BarcodeLookupDto = {
  barcode: string
  source: 'local' | 'user_catalog' | 'shared_catalog' | 'openfoodfacts' | null
  name: string | null
  unit: ProductUnit | null
  cost: number | null
  marginPct: number | null
  categoryId: string | null
  notes: string | null
  existingProductId: string | null
  brand: string | null
}

export function useBarcodeLookup(localId: string) {
  const api = useApiClient()
  return useMutation({
    mutationFn: async (barcode: string) => {
      const res = await api.get<ApiSuccess<{ lookup: BarcodeLookupDto }>>(
        '/api/products/barcode-lookup',
        { params: { localId, barcode: barcode.trim() } },
      )
      return res.data.data.lookup
    },
    onError: () => {
      appToast.error('No se pudo consultar el código de barras')
    },
  })
}
