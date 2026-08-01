import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { TrendingUp, X, Zap, ArrowUpRight } from 'lucide-react'

import { useTheme } from '@/contexts/ThemeContext'
import { CategoryAvatar, getCategoryUi } from '@/lib/categoryUi'
import { formatIndexMonth, indexPeriodYearMonth } from '@/lib/categoryIndex'
import { formatPct, toPctNumber } from '@/lib/formatPct'
import {
  IPC_INDEX_CATEGORY_SLUG,
  IPC_INDEX_LABELS,
  IPC_INDEX_TYPES,
} from '@/lib/ipcLabels'
import { useIpcSeries } from '@/hooks/useIpc'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export type IpcSeriesItem = {
  type: string
  valuePct: number
}

type IpcBreakdownModalProps = {
  open: boolean
  periodIso: string | null
  initialSeries?: IpcSeriesItem[] | null
  generalPct?: number | null
  onClose: () => void
}

/** Etiqueta corta para el eje del gráfico (mobile). */
function shortLabel(type: string): string {
  const full = IPC_INDEX_LABELS[type] ?? type
  if (type === 'IPC_INDEC') return 'Nivel general'
  const cut = full.split(' y ')[0] ?? full
  return cut.length > 14 ? `${cut.slice(0, 13)}…` : cut
}

export function IpcBreakdownModal({
  open,
  periodIso,
  initialSeries,
  generalPct,
  onClose,
}: IpcBreakdownModalProps) {
  const { theme } = useTheme()
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

  const rawSeries: IpcSeriesItem[] = hasInitial
    ? (initialSeries ?? [])
    : (seriesQ.data?.series ?? []).map((s) => ({
        type: s.type,
        valuePct: s.valuePct,
      }))

  const ordered = useMemo(() => {
    const byType = new Map(rawSeries.map((s) => [s.type, s.valuePct]))
    return IPC_INDEX_TYPES.map((type) => {
      const pct = byType.has(type) ? byType.get(type)! : null
      return { type, valuePct: pct }
    }).filter((row) => row.valuePct !== null) as Array<{ type: string; valuePct: number }>
  }, [rawSeries])

  const general =
    toPctNumber(generalPct) ??
    ordered.find((s) => s.type === 'IPC_INDEC')?.valuePct ??
    null

  const divisions = ordered.filter((s) => s.type !== 'IPC_INDEC')
  const top = [...divisions].sort((a, b) => b.valuePct - a.valuePct)[0]
  const monthLabel = periodIso ? formatIndexMonth(periodIso) : 'Período'
  const loading = !hasInitial && seriesQ.isLoading

  /** Gráfico: divisiones ordenadas por % (desc) + nivel general destacado al final o inicio */
  const chartRows = useMemo(() => {
    const divSorted = [...divisions].sort((a, b) => b.valuePct - a.valuePct)
    const gen = ordered.find((s) => s.type === 'IPC_INDEC')
    return gen ? [gen, ...divSorted] : divSorted
  }, [divisions, ordered])

  const tickColor = theme === 'dark' ? '#d6d3d1' : '#44403c'
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(28,25,23,0.06)'

  const chartData = useMemo(
    () => ({
      labels: chartRows.map((r) => shortLabel(r.type)),
      datasets: [
        {
          label: 'Variación %',
          data: chartRows.map((r) => r.valuePct),
          backgroundColor: chartRows.map((r) => {
            if (r.type === 'IPC_INDEC') return '#D97706'
            const slug = IPC_INDEX_CATEGORY_SLUG[r.type] ?? null
            return getCategoryUi(slug).colorHex
          }),
          borderRadius: 6,
          borderSkipped: false as const,
          barThickness: 14,
          maxBarThickness: 18,
        },
      ],
    }),
    [chartRows],
  )

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y' as const,
      layout: { padding: { right: 8, left: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme === 'dark' ? '#1c1917' : '#ffffff',
          titleColor: theme === 'dark' ? '#f5f5f4' : '#1c1917',
          bodyColor: theme === 'dark' ? '#d6d3d1' : '#44403c',
          borderColor: theme === 'dark' ? '#44403c' : '#e8e4df',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            title: (items: { dataIndex: number }[]) => {
              const idx = items[0]?.dataIndex
              if (idx === undefined) return ''
              const row = chartRows[idx]
              return row ? (IPC_INDEX_LABELS[row.type] ?? row.type) : ''
            },
            label: (ctx: { parsed: { x: number | null } }) => {
              const v = ctx.parsed.x
              if (v === null || !Number.isFinite(v)) return ''
              return ` ${v >= 0 ? '+' : ''}${formatPct(v)}%`
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: tickColor,
            font: { family: "'DM Mono', monospace", size: 10 },
            callback: (value: string | number) => `${value}%`,
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: tickColor,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 10, weight: 700 as const },
          },
        },
      },
    }),
    [chartRows, theme, tickColor, gridColor],
  )

  if (!open || typeof document === 'undefined') return null

  const chartHeight = Math.max(280, chartRows.length * 28 + 40)

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="surface-card flex w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] shadow-2xl animate-slide-up sm:rounded-2xl"
        style={{
          maxHeight: 'min(90dvh, 760px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ipc-breakdown-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mt-2 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-border-strong/40 sm:hidden" />

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700 dark:text-accent-500">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2
                id="ipc-breakdown-title"
                className="text-base font-black leading-tight tracking-tight text-text-main sm:text-lg"
              >
                IPC INDEC · {monthLabel}
              </h2>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                Comparativa gráfica por división
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

        <div className="shrink-0 border-b border-border bg-accent-50/80 px-4 py-3 dark:bg-accent-50 sm:px-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-accent-700 dark:text-accent-500">
                Nivel general
              </p>
              <p className="mt-0.5 font-mono text-2xl font-black tabular-nums text-text-main sm:text-3xl">
                {general !== null ? `+${formatPct(general)}%` : '—'}
              </p>
            </div>
            {top ? (
              <div className="flex max-w-[58%] items-end gap-2 text-right">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Mayor suba
                  </p>
                  <p className="mt-0.5 truncate text-xs font-bold text-text-main">
                    {IPC_INDEX_LABELS[top.type] ?? top.type}
                  </p>
                  <p className="font-mono text-sm font-black text-accent-700 dark:text-accent-500">
                    +{formatPct(top.valuePct)}%
                  </p>
                </div>
                <CategoryAvatar slug={IPC_INDEX_CATEGORY_SLUG[top.type] ?? null} size={16} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="space-y-3 p-4">
              <div className="skeleton h-64 w-full rounded-xl" />
              <div className="skeleton h-16 w-full rounded-xl" />
            </div>
          ) : chartRows.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-bold text-text-muted">
                No hay series IPC guardadas para este período.
              </p>
            </div>
          ) : (
            <>
              <div className="px-3 pt-3 sm:px-4">
                <div
                  className="relative w-full rounded-2xl border border-border bg-surface-soft/40 px-1 py-2"
                  style={{ height: Math.min(chartHeight, 420) }}
                >
                  <Bar data={chartData} options={chartOptions} />
                </div>
                <p className="mt-2 px-1 text-[10px] font-bold text-text-muted">
                  Tocá una barra para ver el nombre completo y el %. Colores = rubro COICOP.
                </p>
              </div>

              <div className="mt-2 border-t border-border px-3 py-3 sm:px-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Leyenda con íconos
                </p>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {chartRows.map((row) => {
                    const isGeneral = row.type === 'IPC_INDEC'
                    const slug = IPC_INDEX_CATEGORY_SLUG[row.type] ?? null
                    const label = IPC_INDEX_LABELS[row.type] ?? row.type
                    const { colorHex } = getCategoryUi(slug, isGeneral ? '#D97706' : undefined)
                    return (
                      <li
                        key={row.type}
                        className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-2 py-1.5"
                      >
                        {isGeneral ? (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white">
                            <TrendingUp size={14} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <CategoryAvatar slug={slug} size={14} />
                        )}
                        <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-text-main">
                          {label}
                        </span>
                        <span
                          className={`shrink-0 font-mono text-[11px] font-black tabular-nums ${
                            isGeneral ? 'text-accent-700 dark:text-accent-500' : ''
                          }`}
                          style={isGeneral ? undefined : { color: colorHex }}
                        >
                          {row.valuePct >= 0 ? '+' : ''}
                          {formatPct(row.valuePct)}%
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
          <p className="text-[10px] font-bold leading-relaxed text-text-muted sm:max-w-[45%]">
            Fuente INDEC · aplicá el ajuste desde Productos según el rubro.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary h-11 min-h-[44px] flex-1 px-4 sm:flex-none"
            >
              Cerrar
            </button>
            <Link
              to="/products"
              onClick={onClose}
              className="btn-primary inline-flex h-11 min-h-[44px] flex-1 items-center justify-center gap-2 px-4 sm:flex-none"
            >
              <Zap size={16} strokeWidth={2.5} />
              Aplicar IPC
              <ArrowUpRight size={14} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
