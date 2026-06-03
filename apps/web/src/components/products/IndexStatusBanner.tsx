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
      : new Date(indexPeriod).toLocaleDateString('es-AR')

  if (applied) {
    return (
      <div className="surface-card flex flex-col gap-4 border-primary-200/80 bg-primary-50/40 p-6 dark:border-primary-800/40 dark:bg-primary-900/15 sm:flex-row sm:items-center sm:justify-between animate-slide-up">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-primary-600 text-white shadow-lg shadow-primary-600/20">
            <CheckCircle2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-black text-text-main leading-tight">
              {isIpc ? 'IPC' : 'USD'} de {periodLabel} ya aplicado
            </h3>
            <p className="mt-1 text-[10px] font-extrabold text-text-subtle uppercase tracking-widest">
              {indexValueLabel} · sin pendientes
            </p>
            <p className="mt-2 text-sm font-medium text-text-muted max-w-md">
              Los costos de este local ya reflejan el último índice publicado. Cuando salga uno nuevo,
              te avisamos acá.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group surface-card relative overflow-hidden p-6 animate-slide-up ${
        isIpc
          ? 'border-accent-100 bg-accent-50/50 shadow-accent-600/5'
          : 'border-primary-100 bg-primary-50/50 shadow-primary-600/5'
      }`}
    >
      <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] text-white shadow-lg ${
              isIpc
                ? 'bg-accent-600 shadow-accent-600/20'
                : 'bg-primary-600 shadow-primary-600/20'
            }`}
          >
            <Icon size={24} strokeWidth={2.5} className={isIpc ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h3 className="text-base font-black text-text-main leading-tight">
              {isIpc ? 'IPC pendiente' : 'Variación USD pendiente'}:{' '}
              <span
                className={`font-mono tracking-tighter ${isIpc ? 'text-accent-600' : 'text-primary-700'}`}
              >
                {indexValueLabel}
              </span>
            </h3>
            <p className="mt-1 text-[10px] font-extrabold text-text-subtle uppercase tracking-widest">
              Período: {periodLabel}
            </p>
            <p className="mt-3 text-sm font-medium text-text-muted max-w-md leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenBulk}
          className={`w-full sm:w-auto h-12 px-6 shadow-lg group/btn animate-scale-in ${
            isIpc ? 'btn-warning shadow-accent-600/20' : 'btn-primary shadow-primary-600/20'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isIpc ? 'Aplicar IPC' : 'Aplicar USD'}
          </span>
          <ChevronRight
            size={16}
            strokeWidth={3}
            className="ml-2 inline transition-transform group-hover/btn:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  )
}
