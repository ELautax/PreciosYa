import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, X, Zap, ArrowUpRight } from 'lucide-react'

import { CategoryAvatar, getCategoryUi } from '@/lib/categoryUi'
import { formatIndexMonth, indexPeriodYearMonth } from '@/lib/categoryIndex'
import { formatPct, toPctNumber } from '@/lib/formatPct'
import {
  IPC_INDEX_CATEGORY_SLUG,
  IPC_INDEX_LABELS,
  IPC_INDEX_TYPES,
} from '@/lib/ipcLabels'
import { useIpcSeries } from '@/hooks/useIpc'

export type IpcSeriesItem = {
  type: string
  valuePct: number
}

type IpcBreakdownModalProps = {
  open: boolean
  periodIso: string | null
  /** Series desde metadata de la notificación (opcional; si faltan se pide al API). */
  initialSeries?: IpcSeriesItem[] | null
  generalPct?: number | null
  onClose: () => void
}

function barWidthPct(value: number, maxAbs: number): number {
  if (maxAbs <= 0) return 0
  return Math.min(100, (Math.abs(value) / maxAbs) * 100)
}

export function IpcBreakdownModal({
  open,
  periodIso,
  initialSeries,
  generalPct,
  onClose,
}: IpcBreakdownModalProps) {
  const periodYm = periodIso ? indexPeriodYearMonth(periodIso) : null
  const hasInitial = Boolean(initialSeries && initialSeries.length > 0)
  const seriesQ = useIpcSeries({
    periodYm,
    enabled: open && !hasInitial,
  })

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const rawSeries: IpcSeriesItem[] = hasInitial
    ? (initialSeries ?? [])
    : (seriesQ.data?.series ?? []).map((s) => ({
        type: s.type,
        valuePct: s.valuePct,
      }))

  const byType = new Map(rawSeries.map((s) => [s.type, s.valuePct]))
  const ordered = IPC_INDEX_TYPES.map((type) => {
    const pct = byType.has(type) ? byType.get(type)! : null
    return { type, valuePct: pct }
  }).filter((row) => row.valuePct !== null) as Array<{ type: string; valuePct: number }>

  const general =
    toPctNumber(generalPct) ??
    ordered.find((s) => s.type === 'IPC_INDEC')?.valuePct ??
    null

  const divisions = ordered.filter((s) => s.type !== 'IPC_INDEC')
  const maxAbs = Math.max(...ordered.map((s) => Math.abs(s.valuePct)), 0.01)
  const top = [...divisions].sort((a, b) => b.valuePct - a.valuePct)[0]
  const monthLabel = periodIso ? formatIndexMonth(periodIso) : 'Período'

  const loading = !hasInitial && seriesQ.isLoading

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="surface-card flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] shadow-2xl animate-slide-up sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ipc-breakdown-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-border-strong/40 sm:hidden" />

        <div className="flex items-start justify-between gap-3 border-b border-border bg-surface px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 dark:text-accent-500">
              <TrendingUp size={22} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2
                id="ipc-breakdown-title"
                className="text-lg font-black leading-tight tracking-tight text-text-main"
              >
                IPC INDEC · {monthLabel}
              </h2>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                Variación mensual por división COICOP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-soft p-2 text-text-muted transition-all hover:bg-border active:scale-90"
            aria-label="Cerrar"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="border-b border-border bg-accent-50/80 px-5 py-4 dark:bg-accent-50 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-accent-700 dark:text-accent-500">
                Nivel general
              </p>
              <p className="mt-1 font-mono text-3xl font-black tabular-nums text-text-main">
                {general !== null ? `+${formatPct(general)}%` : '—'}
              </p>
            </div>
            {top ? (
              <div className="max-w-[55%] text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Mayor suba
                </p>
                <p className="mt-1 truncate text-xs font-bold text-text-main">
                  {IPC_INDEX_LABELS[top.type] ?? top.type}
                </p>
                <p className="font-mono text-sm font-black text-accent-700 dark:text-accent-500">
                  +{formatPct(top.valuePct)}%
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 scrollbar-hide sm:px-5">
          {loading ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : ordered.length === 0 ? (
            <div className="px-2 py-10 text-center">
              <p className="text-sm font-bold text-text-muted">
                No hay series IPC guardadas para este período.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {ordered.map((row) => {
                const isGeneral = row.type === 'IPC_INDEC'
                const slug = IPC_INDEX_CATEGORY_SLUG[row.type] ?? null
                const label = IPC_INDEX_LABELS[row.type] ?? row.type
                const { colorHex } = getCategoryUi(slug, isGeneral ? '#D97706' : undefined)
                const width = barWidthPct(row.valuePct, maxAbs)
                const isTop = top?.type === row.type

                return (
                  <li
                    key={row.type}
                    className={`relative overflow-hidden rounded-2xl border px-3 py-3 ${
                      isGeneral
                        ? 'border-accent-200 bg-accent-50/70 dark:border-accent-200'
                        : isTop
                          ? 'border-primary-200 bg-primary-50/40'
                          : 'border-border bg-surface'
                    }`}
                  >
                    <div className="relative z-[1] flex items-center gap-3">
                      {isGeneral ? (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white">
                          <TrendingUp size={18} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <CategoryAvatar slug={slug} size={18} />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-black text-text-main">{label}</p>
                          <p
                            className={`shrink-0 font-mono text-sm font-black tabular-nums ${
                              isGeneral ? 'text-accent-700 dark:text-accent-500' : ''
                            }`}
                            style={isGeneral ? undefined : { color: colorHex }}
                          >
                            {row.valuePct >= 0 ? '+' : ''}
                            {formatPct(row.valuePct)}%
                          </p>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${width}%`,
                              backgroundColor: isGeneral ? '#D97706' : colorHex,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[10px] font-bold leading-relaxed text-text-muted">
            Fuente oficial INDEC · aplicá el ajuste desde Productos según el rubro de cada artículo.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary h-11 flex-1 px-4 sm:flex-none">
              Cerrar
            </button>
            <Link
              to="/products"
              onClick={onClose}
              className="btn-primary inline-flex h-11 flex-1 items-center justify-center gap-2 px-4 sm:flex-none"
            >
              <Zap size={16} strokeWidth={2.5} />
              Aplicar IPC
              <ArrowUpRight size={14} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
