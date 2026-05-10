import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { LocalSelector } from '@/components/locals/LocalSelector'
import { PriceHistoryChart } from '@/components/history/PriceHistoryChart'
import { PriceHistoryTable } from '@/components/history/PriceHistoryTable'
import { useIpcHistory } from '@/hooks/useIpc'
import { useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { useProductHistory, useProducts } from '@/hooks/useProducts'

export default function HistoryPage() {
  const { data: locals, isLoading: loadingLocals } = useLocals()
  const [localId, setLocalId] = useSelectedLocal(locals)
  const [productId, setProductId] = useState('')

  const productsQ = useProducts(localId, { limit: 100 })
  const historyQ = useProductHistory(productId || undefined)
  const ipcHistoryQ = useIpcHistory()

  const products = productsQ.data?.items ?? []
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId],
  )
  const historyRows = historyQ.data ?? []
  const marginTrendMonths = useMemo(() => {
    const months = new Set<string>()
    historyRows.forEach((row) => {
      const d = new Date(row.recordedAt)
      if (!Number.isNaN(d.getTime())) {
        months.add(`${d.getFullYear()}-${d.getMonth() + 1}`)
      }
    })
    return months.size
  }, [historyRows])

  useEffect(() => {
    if (!products.length) {
      setProductId('')
      return
    }
    if (!products.some((p) => p.id === productId)) {
      setProductId(products[0].id)
    }
  }, [products, productId])

  if (loadingLocals) {
    return (
      <div className="page-shell">
        <div className="page-wrap max-w-5xl space-y-4">
          <div className="h-10 w-56 animate-pulse rounded bg-stone-200" />
          <div className="h-14 animate-pulse rounded-xl bg-stone-200" />
          <div className="h-72 animate-pulse rounded-xl bg-stone-200" />
        </div>
      </div>
    )
  }

  if (!locals?.length) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-lg">
          <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
            ← Panel
          </Link>
            <h1 className="mt-2 page-heading">Historial</h1>
          <p className="mt-2 text-sm text-stone-600">Primero creá un local y productos.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <div className="page-wrap max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
              ← Panel
            </Link>
            <h1 className="mt-2 page-heading">Historial de precios</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/products"
              className="btn-soft"
            >
              Productos
            </Link>
            <Link
              to="/locals"
              className="btn-soft"
            >
              Locales
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
          <label className="flex items-center gap-2 text-sm text-stone-700">
            Producto
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedProduct ? (
          <p className="text-sm text-stone-600">
            Mostrando historial de <span className="font-medium text-stone-800">{selectedProduct.name}</span>
          </p>
        ) : null}

        {productsQ.isLoading ? (
          <div className="space-y-4">
            <div className="h-72 animate-pulse rounded-xl bg-stone-200" />
            <div className="h-64 animate-pulse rounded-xl bg-stone-200" />
          </div>
        ) : products.length === 0 ? (
          <div className="surface-card p-5 text-sm text-stone-600">
            No hay productos en este local todavía. Creá uno para empezar a registrar historial.
          </div>
        ) : historyQ.isLoading ? (
          <div className="space-y-4">
            <div className="h-72 animate-pulse rounded-xl bg-stone-200" />
            <div className="h-64 animate-pulse rounded-xl bg-stone-200" />
          </div>
        ) : historyRows.length > 0 ? (
          <>
            {marginTrendMonths < 2 ? (
              <div className="surface-card p-5 text-sm text-stone-600">
                Necesitás más historial para ver la tendencia.
              </div>
            ) : (
              <PriceHistoryChart rows={historyRows} />
            )}
            <PriceHistoryTable rows={historyRows} />
          </>
        ) : (
          <div className="surface-card p-5 text-sm text-stone-600">
            No hay historial para este producto todavía.
          </div>
        )}

        <section className="surface-card p-4">
          <h3 className="text-sm font-medium text-stone-800">Últimos IPC registrados</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ipcHistoryQ.data?.map((row) => (
              <div key={row.id} className="surface-soft p-3">
                <p className="text-xs text-stone-500">
                  {new Date(row.period).toLocaleDateString('es-AR')}
                </p>
                <p className="mono text-sm font-medium text-stone-900">{row.valuePct.toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
