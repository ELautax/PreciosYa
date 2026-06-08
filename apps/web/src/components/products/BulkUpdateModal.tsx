import { useState } from 'react'
import { X, Zap, TrendingUp, Info, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react'

import { useCategories } from '@/hooks/useCategories'
import {
  useApplyIpcToLocal,
  useApplyUsdToLocal,
  useIpcBreakdownForLocal,
  useUsdBreakdownForLocal,
} from '@/hooks/useLocals'
import { useBulkUpdate } from '@/hooks/useProducts'
import { categoryIndexLabel } from '@/lib/categoryIndex'
import { isOfflineQueued } from '@/lib/offline'

type BulkUpdateModalProps = {
  localId: string
  ipcPct: number | null
  usdRateArs?: number | null
  usdVariationPct?: number | null
  initialTab?: TabMode
  onClose: () => void
}

type TabMode = 'percentage' | 'ipc' | 'usd'

export function BulkUpdateModal({
  localId,
  ipcPct,
  usdRateArs = null,
  usdVariationPct = null,
  initialTab = 'percentage',
  onClose,
}: BulkUpdateModalProps) {
  const [tab, setTab] = useState<TabMode>(initialTab)
  const [increasePct, setIncreasePct] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [resultMsg, setResultMsg] = useState<{ text: string; type: 'success' | 'warning' } | null>(null)

  const categoriesQuery = useCategories(localId)
  const ipcBreakdownQ = useIpcBreakdownForLocal(localId)
  const usdBreakdownQ = useUsdBreakdownForLocal(localId)
  const bulkMut = useBulkUpdate(localId)
  const applyIpcMut = useApplyIpcToLocal(localId)
  const applyUsdMut = useApplyUsdToLocal(localId)

  async function handleByPercentage(): Promise<void> {
    const pct = Number(increasePct)
    if (!Number.isFinite(pct)) return
    const res = await bulkMut.mutateAsync({
      localId,
      increasePct: pct,
      ...(categoryId ? { categoryId } : {}),
    })
    if (isOfflineQueued(res)) {
      setResultMsg({
        text: 'Sin conexión: la actualización quedó en cola y se aplicará al reconectar.',
        type: 'warning',
      })
      return
    }
    setResultMsg({
      text: `Se actualizaron ${res.updated} producto(s) correctamente.`,
      type: 'success',
    })
  }

  async function handleApplyIpc(): Promise<void> {
    const res = await applyIpcMut.mutateAsync()
    setResultMsg({
      text: `IPC ${res.appliedIpcPct.toFixed(2)}% aplicado en ${res.updated} producto(s).`,
      type: 'success',
    })
  }

  async function handleApplyUsd(): Promise<void> {
    const res = await applyUsdMut.mutateAsync()
    setResultMsg({
      text: `USD ${res.appliedUsdPct.toFixed(2)}% aplicado en ${res.updated} producto(s) indexados.`,
      type: 'success',
    })
  }

  const pending = bulkMut.isPending || applyIpcMut.isPending || applyUsdMut.isPending
  const usdPct = usdVariationPct ?? usdBreakdownQ.data?.variationPct ?? null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4 animate-fade-in backdrop-blur-sm">
      <div
        className="surface-card flex flex-col max-h-[92vh] w-full max-w-xl overflow-hidden animate-slide-up shadow-2xl rounded-t-[2rem] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Handle */}
        <div className="mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-border-strong/40 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600 text-white shadow-lg shadow-accent-600/20">
                <Zap size={20} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col">
                <h2 className="text-lg font-black tracking-tight text-text-main leading-none">Actualización Masiva</h2>
                <p className="mt-1.5 text-[10px] font-black text-text-subtle uppercase tracking-widest leading-none">Ajuste de Precios</p>
             </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-surface-soft p-2 text-text-subtle transition-all hover:bg-border active:scale-90">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 pt-2 scrollbar-hide">
          {/* Tabs */}
          <div className="flex p-1 rounded-2xl bg-surface-soft border border-border mb-6">
            <button
              onClick={() => { setTab('percentage'); setResultMsg(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                tab === 'percentage' ? 'bg-surface text-primary-600 shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Zap size={14} />
              Porcentaje
            </button>
            <button
              onClick={() => { setTab('ipc'); setResultMsg(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                tab === 'ipc' ? 'bg-surface text-primary-600 shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <TrendingUp size={14} />
              IPC
            </button>
            <button
              onClick={() => { setTab('usd'); setResultMsg(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                tab === 'usd' ? 'bg-surface text-primary-600 shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <DollarSign size={14} />
              USD
            </button>
          </div>

          {tab === 'percentage' ? (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2 px-1">
                   Aumento (%)
                </label>
                <div className="relative">
                   <input
                    type="number"
                    value={increasePct}
                    onChange={(e) => setIncreasePct(e.target.value)}
                    step="0.01"
                    className="w-full pl-5 pr-12 font-mono text-xl font-black text-primary-600 h-14"
                    placeholder="8.5"
                    autoFocus
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-text-subtle font-black text-lg">%</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">
                   Filtrar por Categoría (Opcional)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-12"
                >
                  <option value="">Todas las categorías</option>
                  {categoriesQuery.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-primary-50/50 p-4 border border-primary-100 dark:bg-primary-900/10 dark:border-primary-800/30">
                 <Info size={18} className="text-primary-600 shrink-0 mt-0.5" />
                 <p className="text-xs font-medium text-text-muted leading-relaxed">
                    Esta acción incrementará el costo de los productos seleccionados. El precio de venta se recalculará automáticamente.
                 </p>
              </div>

              <button
                type="button"
                onClick={() => void handleByPercentage()}
                disabled={pending || !increasePct}
                className="btn-primary w-full h-14 shadow-xl shadow-primary-600/20"
              >
                <Zap size={20} strokeWidth={3} />
                <span className="text-sm font-black uppercase tracking-widest">Aplicar Aumento</span>
              </button>
            </div>
          ) : tab === 'ipc' ? (
            <div className="space-y-6 animate-fade-in">
              {ipcBreakdownQ.isLoading ? (
                <div className="space-y-4">
                  <div className="skeleton h-14 w-full" />
                  <div className="skeleton h-40 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 rounded-2xl bg-accent-50/50 p-5 border border-accent-100 dark:bg-accent-900/10 dark:border-accent-800/30">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white shadow-sm">
                       <TrendingUp size={24} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-text-subtle uppercase tracking-widest leading-none">IPC Referencia</p>
                      <p className="mt-1.5 text-2xl font-black text-text-main leading-none">
                        {ipcPct !== null ? `${ipcPct.toFixed(2)}%` : 'Sin datos'}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="max-h-60 overflow-y-auto scrollbar-hide overscroll-contain">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-surface-soft/50">
                            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">Rubro</th>
                            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">Índice</th>
                            <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle text-right">Ajuste</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {ipcBreakdownQ.data?.breakdown.map((row) => (
                            <tr key={`${row.categoryId ?? 'none'}-${row.requestedIndexType}`} className="hover:bg-primary-50/5 transition-colors">
                              <td className="px-5 py-4 font-bold text-text-main truncate max-w-[140px]">{row.categoryName}</td>
                              <td className="px-5 py-4">
                                <span className="inline-flex flex-col gap-0.5">
                                  <span className="inline-flex rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-tighter border border-accent-100 bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:border-accent-800/40">
                                    {categoryIndexLabel(row.appliedIndexType)}
                                  </span>
                                  {row.usedGeneralFallback && (
                                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
                                      General
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-mono font-black text-accent-600 text-right">+{row.ipcPct.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleApplyIpc()}
                    disabled={pending || ipcPct === null || ipcBreakdownQ.isLoading}
                    className="btn-warning w-full h-14 shadow-xl shadow-accent-600/20"
                  >
                    <CheckCircle2 size={20} strokeWidth={3} />
                    <span className="text-sm font-black uppercase tracking-widest">Confirmar y Aplicar</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {usdBreakdownQ.isLoading ? (
                <div className="space-y-4">
                  <div className="skeleton h-14 w-full" />
                  <div className="skeleton h-40 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 rounded-2xl bg-primary-50/50 p-5 border border-primary-100 dark:bg-primary-900/10 dark:border-primary-800/30">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                      <DollarSign size={24} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-text-subtle uppercase tracking-widest leading-none">
                        Dólar oficial BCRA
                      </p>
                      <p className="mt-1.5 text-2xl font-black text-text-main leading-none">
                        {usdRateArs !== null
                          ? `$${usdRateArs.toLocaleString('es-AR')}`
                          : usdBreakdownQ.data?.usdRateArs != null
                            ? `$${usdBreakdownQ.data.usdRateArs.toLocaleString('es-AR')}`
                            : 'Sin datos'}
                      </p>
                      <p className="mt-1 text-sm font-mono font-bold text-primary-700">
                        {usdPct !== null
                          ? `${usdPct >= 0 ? '+' : ''}${usdPct.toFixed(2)}%`
                          : ''}
                      </p>
                    </div>
                  </div>

                  {usdBreakdownQ.data?.breakdown.length === 0 ? (
                    <p className="text-sm font-medium text-text-muted rounded-2xl border border-border p-4">
                      Ningún rubro activo está marcado como &quot;Indexar USD&quot;.
                    </p>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                      <div className="max-h-60 overflow-y-auto scrollbar-hide overscroll-contain">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-surface-soft/50">
                              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">
                                Rubro (USD)
                              </th>
                              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle text-right">
                                Prod.
                              </th>
                              <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle text-right">
                                Ajuste
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {usdBreakdownQ.data?.breakdown.map((row) => (
                              <tr key={row.categoryId} className="hover:bg-primary-50/5 transition-colors">
                                <td className="px-5 py-4 font-bold text-text-main truncate max-w-[180px]">
                                  {row.categoryName}
                                </td>
                                <td className="px-5 py-4 font-mono text-right text-text-muted">
                                  {row.productCount}
                                </td>
                                <td className="px-5 py-4 font-mono font-black text-primary-700 text-right">
                                  {usdPct !== null ? `${usdPct >= 0 ? '+' : ''}${usdPct.toFixed(2)}%` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleApplyUsd()}
                    disabled={
                      pending ||
                      usdPct === null ||
                      usdBreakdownQ.isLoading ||
                      !usdBreakdownQ.data?.breakdown.length
                    }
                    className="btn-primary w-full h-14 shadow-xl shadow-primary-600/20"
                  >
                    <CheckCircle2 size={20} strokeWidth={3} />
                    <span className="text-sm font-black uppercase tracking-widest">
                      Confirmar variación
                    </span>
                  </button>
                </>
              )}
            </div>
          )}

          {resultMsg && (
            <div className={`mt-8 rounded-2xl border p-5 animate-scale-in flex items-start gap-4 ${
              resultMsg.type === 'success' ? 'border-primary-100 bg-primary-50/50 text-primary-800' : 'border-warning-100 bg-warning-50/50 text-warning-800'
            }`}>
              {resultMsg.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertTriangle size={20} className="shrink-0 mt-0.5" />}
              <p className="text-sm font-bold leading-relaxed">{resultMsg.text}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-surface px-6 py-6 pb-safe sm:pb-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full sm:w-32 h-12 text-xs font-black uppercase tracking-widest shadow-none border-none bg-surface-soft hover:bg-border/30"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
