import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

import { server } from '@/test/server'

vi.mock('@/lib/offline', () => ({
  saveOfflineSnapshot: vi.fn().mockResolvedValue(undefined),
  readOfflineSnapshot: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/hooks/useApiClient', () => ({
  useApiClient: () =>
    axios.create({
      baseURL: 'http://localhost',
      headers: { 'Content-Type': 'application/json' },
    }),
}))

import { useProducts } from './useProducts'

describe('useProducts', () => {
  it('obtiene productos desde API usando query params', async () => {
    server.use(
      http.get('http://localhost/api/products', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('localId')).toBe('11111111-1111-4111-8111-111111111111')
        return HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: 'p1',
                localId: '11111111-1111-4111-8111-111111111111',
                categoryId: null,
                name: 'Leche',
                barcode: null,
                unit: 'unidad',
                cost: 100,
                marginPct: 20,
                salePrice: 120,
                isMarginAlert: false,
                notes: null,
                isActive: true,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
          },
        })
      }),
    )

    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () =>
        useProducts('11111111-1111-4111-8111-111111111111', {
          search: 'lec',
          page: 1,
        }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.total).toBe(1)
    expect(result.current.data?.items[0]?.name).toBe('Leche')
  })
})
