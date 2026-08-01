import { CheckCircle2, ChevronRight, TrendingUp, DollarSign } from 'lucide-react'

import { formatIndexMonth, isIndexPeriodApplied } from '@/lib/categoryIndex'

type IndexStatusBannerProps = {
  variant: 'ipc' | 'usd'
  indexPeriod: string | null
  indexValueLabel: string
  lastAppliedPeriod: string | null
  description: string
  onOpenBulk: () => void
}

export function IndexStatusBanner({
  variant,
  indexPeriod,
  indexValueLabel,
  lastAppliedPeriod,
  description,
  onOpenBulk,
}: IndexStatusBannerProps) {
  if (!indexPeriod) return null

  const applied = isIndexPeriodApplied(
    indexPeriod,
    lastAppliedPeriod,
    variant === 'ipc' ? 'monthly' : 'daily',
  )

  const isIpc = variant === 'ipc'
  const Icon = isIpc ? TrendingUp : DollarSign
  const periodLabel =
    variant === 'ipc' && indexPeriod
      ? formatIndexMonth(indexPeriod)
      : new Date(indexPeriod).toLocaleDateString('es-AR', { timeZone: 'UTC' })

  // Compacto cuando ya está aplicado: no ocupa el viewport móvil
  if (applied) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-primary-200/70 bg-primary-50/50 px-3 py-2.5 dark:border-primary-800/40 dark:bg-primary-900/20 animate-fade-in">
        <CheckCircle2 size={18} strokeWidth={2.5} className="shrink-0 text-primary-600" />
        <p className="min-w-0 flex-1 text-xs font-bold leading-snug text-text-main">
          <span className="text-primary-700 dark:text-primary-500">
            {isIpc ? 'IPC' : 'USD'} de {periodLabel} ya aplicado
          </span>
          <span className="text-text-muted"> · {indexValueLabel}</span>
        </p>
      </div>
    )
  }

  return (
    <div
      className={`group surface-card relative overflow-hidden p-4 sm:p-5 animate-slide-up ${
        isIpc
          ? 'border-accent-100 bg-accent-50/50 shadow-accent-600/5'
          : 'border-primary-100 bg-primary-50/50 shadow-primary-600/5'
      }`}
    >
      <div className="relative flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg sm:h-12 sm:w-12 ${
              isIpc
                ? 'bg-accent-600 shadow-accent-600/20'
                : 'bg-primary-600 shadow-primary-600/20'
            }`}
          >
            <Icon size={22} strokeWidth={2.5} className={isIpc ? 'animate-pulse' : ''} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-text-main leading-tight sm:text-base">
              {isIpc ? 'IPC pendiente' : 'Variación USD pendiente'}:{' '}
              <span
                className={`font-mono tracking-tighter ${isIpc ? 'text-accent-600' : 'text-primary-700'}`}
              >
                {indexValueLabel}
              </span>
            </h3>
            <p className="mt-1 text-xs font-semibold text-text-subtle">
              Período: {periodLabel}
            </p>
            <p className="mt-2 text-sm font-medium text-text-muted max-w-md leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenBulk}
          className={`h-11 w-full shrink-0 px-5 shadow-lg group/btn sm:w-auto ${
            isIpc ? 'btn-warning shadow-accent-600/20' : 'btn-primary shadow-primary-600/20'
          }`}
        >
          <span className="text-xs font-black">
            {isIpc ? 'Aplicar IPC' : 'Aplicar USD'}
          </span>
          <ChevronRight
            size={16}
            strokeWidth={3}
            className="ml-1.5 inline transition-transform group-hover/btn:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  )
}
