import { useState } from 'react'

import { useCategories } from '@/hooks/useCategories'
import { useApplyIpcToLocal, useIpcBreakdownForLocal } from '@/hooks/useLocals'
import { useBulkUpdate } from '@/hooks/useProducts'
import { isOfflineQueued } from '@/lib/offline'

type BulkUpdateModalProps = {
  localId: string
  ipcPct: number | null
  onClose: () => void
}

type TabMode = 'percentage' | 'ipc'

export function BulkUpdateModal({ localId, ipcPct, onClose }: BulkUpdateModalProps) {
  const [tab, setTab] = useState<TabMode>('percentage')
  const [increasePct, setIncreasePct] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [resultMsg, setResultMsg] = useState<string | null>(null)

  const categoriesQuery = useCategories(localId)
  const ipcBreakdownQ = useIpcBreakdownForLocal(localId)
  const bulkMut = useBulkUpdate(localId)
  const applyIpcMut = useApplyIpcToLocal(localId)

  async function handleByPercentage(): Promise<void> {
    const pct = Number(increasePct)
    if (!Number.isFinite(pct)) return
    const res = await bulkMut.mutateAsync({
      localId,
      increasePct: pct,
      ...(categoryId ? { categoryId } : {}),
    })
    if (isOfflineQueued(res)) {
      setResultMsg(
        'Sin conexión: la actualización quedó en cola y se aplicará en orden al reconectar.',
      )
      return
    }
    setResultMsg(`Se actualizaron ${res.updated} producto(s).`)
  }

  async function handleApplyIpc(): Promise<void> {
    const res = await applyIpcMut.mutateAsync()
    setResultMsg(
      `IPC ${res.appliedIpcPct.toFixed(2)}% aplicado en ${res.updated} producto(s).`,
    )
  }

  const pending = bulkMut.isPending || applyIpcMut.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="surface-card w-full max-w-xl p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold text-stone-900">Actualización masiva</h2>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('percentage')}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === 'percentage'
                ? 'bg-green-600 text-white'
                : 'btn-soft'
            }`}
          >
            Por porcentaje
          </button>
          <button
            type="button"
            onClick={() => setTab('ipc')}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === 'ipc'
                ? 'bg-green-600 text-white'
                : 'btn-soft'
            }`}
          >
            Aplicar IPC
          </button>
        </div>

        {tab === 'percentage' ? (
          <div className="mt-4 space-y-3">
            <label className="block text-sm text-stone-700">
              Aumento (%)
              <input
                type="number"
                value={increasePct}
                onChange={(e) => setIncreasePct(e.target.value)}
                step="0.01"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                placeholder="Ej. 8.5"
              />
            </label>
            <label className="block text-sm text-stone-700">
              Categoría (opcional)
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void handleByPercentage()}
              disabled={pending}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              Aplicar aumento
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {ipcBreakdownQ.isLoading ? (
              <div className="space-y-2">
                <div className="h-12 animate-pulse rounded-lg bg-stone-200" />
                <div className="h-12 animate-pulse rounded-lg bg-stone-200" />
              </div>
            ) : (
              <>
                <p className="text-sm text-stone-700">
                  {ipcPct !== null
                    ? `Se aplicará IPC por categoría. Referencia general actual: ${ipcPct.toFixed(2)}%.`
                    : 'No hay IPC disponible en este momento.'}
                </p>
                <div className="max-h-52 overflow-y-auto rounded-lg border border-stone-200">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                        <th className="px-3 py-2">Categoría</th>
                        <th className="px-3 py-2">Índice</th>
                        <th className="px-3 py-2">IPC</th>
                        <th className="px-3 py-2">Productos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ipcBreakdownQ.data?.breakdown.map((row) => (
                        <tr key={`${row.categoryId ?? 'none'}-${row.requestedIndexType}`} className="border-b border-stone-100 last:border-0">
                          <td className="px-3 py-2">{row.categoryName}</td>
                          <td className="px-3 py-2">
                            {row.appliedIndexType === 'IPC_INDEC_ALIMENTOS' ? 'IPC Alimentos' : 'IPC General'}
                            {row.requestedIndexType !== row.appliedIndexType ? ' (fallback)' : ''}
                          </td>
                          <td className="mono px-3 py-2">{row.ipcPct.toFixed(2)}%</td>
                          <td className="mono px-3 py-2">{row.productCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => void handleApplyIpc()}
              disabled={pending || ipcPct === null || ipcBreakdownQ.isLoading}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
            >
              Confirmar y aplicar IPC
            </button>
          </div>
        )}

        {resultMsg ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {resultMsg}
          </div>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-soft px-4 py-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
