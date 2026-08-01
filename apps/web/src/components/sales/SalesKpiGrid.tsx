import { DollarSign, Package, Receipt, TrendingUp, ShoppingBag } from 'lucide-react'
import type { SalesPeriod } from 'shared'

import { fmtArs } from '@/components/sales/format'
import type { SalesDashboardDto } from '@/types/sales'

type SalesKpiGridProps = {
  data: SalesDashboardDto
  isPro: boolean
  period: SalesPeriod
}

type KpiCard = {
  label: string
  value: string
  hint?: string
  icon: typeof DollarSign
  accentClass: string
  barColor: string
  hidden?: boolean
}

const PERIOD_LABEL: Record<SalesPeriod, string> = {
  today: 'Hoy',
  '7d': '7 días',
  '30d': '30 días',
  '90d': '90 días',
  month: 'Este mes',
  custom: 'Período',
}

export function SalesKpiGrid({ data, isPro, period }: SalesKpiGridProps) {
  const periodLabel = PERIOD_LABEL[period] ?? 'Período'
  const cards: KpiCard[] = [
    {
      label: `Ventas · ${periodLabel}`,
      value: fmtArs(data.totalRevenue),
      icon: DollarSign,
      accentClass: 'text-primary-600',
      barColor: 'bg-primary-600',
    },
    {
      label: period === 'today' ? 'Ventas hoy' : 'Hoy (referencia)',
      value: fmtArs(data.salesToday),
      icon: TrendingUp,
      accentClass: 'text-accent-600',
      barColor: 'bg-accent-600',
      hidden: period === 'today',
    },
    {
      label: 'Ganancia estimada',
      value: data.totalProfit !== null ? fmtArs(data.totalProfit) : data.profitMonth !== null ? fmtArs(data.profitMonth) : '—',
      hint: 'Venta − costo al momento de cada venta',
      icon: Receipt,
      accentClass: 'text-primary-600',
      barColor: 'bg-primary-600',
      hidden: !isPro && data.totalProfit === null && data.profitMonth === null,
    },
    {
      label: 'Unidades',
      value: String(data.unitsSold),
      icon: Package,
      accentClass: 'text-primary-600',
      barColor: 'bg-primary-600',
    },
    {
      label: 'Ticket promedio',
      value: fmtArs(data.averageTicket),
      icon: ShoppingBag,
      accentClass: 'text-accent-600',
      barColor: 'bg-accent-600',
    },
  ].filter((c) => !c.hidden)

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className="min-w-0 rounded-2xl border border-border bg-surface-soft/40 p-4"
        >
          <div className={`mb-3 h-0.5 w-8 rounded-full ${card.barColor} opacity-70`} />
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold leading-tight text-text-subtle">{card.label}</p>
            <card.icon size={14} className={`${card.accentClass} mt-0.5 shrink-0`} strokeWidth={2.5} />
          </div>
          <p className="mt-2 truncate font-mono text-xl font-black tracking-tighter text-text-main sm:text-2xl">
            {card.value}
          </p>
          {card.hint ? (
            <p className="mt-1 text-[10px] font-medium leading-snug text-text-subtle">{card.hint}</p>
          ) : null}
        </article>
      ))}
    </div>
  )
}
