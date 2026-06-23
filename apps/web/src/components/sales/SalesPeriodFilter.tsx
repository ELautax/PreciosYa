import type { SalesPeriod } from 'shared'
import { FREE_SALES_PERIODS, PRO_SALES_PERIODS } from 'shared'

const LABELS: Record<SalesPeriod, string> = {
  today: 'Hoy',
  '7d': '7 días',
  '30d': '30 días',
  '90d': '90 días',
  month: 'Este mes',
  custom: 'Personalizado',
}

type SalesPeriodFilterProps = {
  value: SalesPeriod
  onChange: (period: SalesPeriod) => void
  isPro: boolean
}

export function SalesPeriodFilter({ value, onChange, isPro }: SalesPeriodFilterProps) {
  const periods = isPro ? PRO_SALES_PERIODS : FREE_SALES_PERIODS

  const fewOptions = periods.length <= 3

  return (
    <div
      className={`min-w-0 rounded-2xl border border-border bg-surface-soft p-1 ${
        fewOptions
          ? 'grid grid-cols-2 gap-1 sm:flex sm:flex-wrap'
          : 'flex gap-1 overflow-x-auto scrollbar-hide'
      }`}
    >
      {periods.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all min-h-[44px] active:scale-95 ${
            fewOptions ? 'w-full sm:w-auto sm:shrink-0' : 'shrink-0'
          } ${
            value === p
              ? 'bg-surface text-primary-600 shadow-sm ring-1 ring-border/50'
              : 'text-text-subtle hover:bg-surface/60 hover:text-text-main'
          }`}
        >
          {LABELS[p]}
        </button>
      ))}
    </div>
  )
}
