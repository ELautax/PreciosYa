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
      <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600">
        Cargando…
      </div>
    )
  }

  if (!locals?.length) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-10">
        <div className="mx-auto max-w-lg">
          <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
            ← Panel
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">Historial</h1>
          <p className="mt-2 text-sm text-stone-600">Primero creá un local y productos.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
              ← Panel
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-stone-900">Historial de precios</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/products"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
            >
              Productos
            </Link>
            <Link
              to="/locals"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
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

        {historyQ.isLoading ? (
          <p className="text-sm text-stone-600">Cargando historial…</p>
        ) : historyQ.data && historyQ.data.length > 0 ? (
          <>
            <PriceHistoryChart rows={historyQ.data} />
            <PriceHistoryTable rows={historyQ.data} />
          </>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
            No hay historial para este producto todavía.
          </div>
        )}

        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="text-sm font-medium text-stone-800">Últimos IPC registrados</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ipcHistoryQ.data?.map((row) => (
              <div key={row.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs text-stone-500">
                  {new Date(row.period).toLocaleDateString('es-AR')}
                </p>
                <p className="text-sm font-medium text-stone-900">{row.valuePct.toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
