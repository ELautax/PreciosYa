import { DollarSign, Package, Receipt, TrendingUp, ShoppingBag } from 'lucide-react'

import { fmtArs } from '@/components/sales/format'
import type { SalesDashboardDto } from '@/types/sales'

type SalesKpiGridProps = {
  data: SalesDashboardDto
  isPro: boolean
}

type KpiCard = {
  label: string
  value: string
  icon: typeof DollarSign
  accentClass: string
  barColor: string
  hidden?: boolean
}

export function SalesKpiGrid({ data, isPro }: SalesKpiGridProps) {
  const cards: KpiCard[] = [
    {
      label: 'Ventas hoy',
      value: fmtArs(data.salesToday),
      icon: DollarSign,
      accentClass: 'text-primary-600',
      barColor: 'bg-primary-600',
    },
    {
      label: isPro ? 'Ventas mes' : 'Ventas período',
      value: fmtArs(isPro ? data.salesMonth : data.totalRevenue),
      icon: TrendingUp,
      accentClass: 'text-accent-600',
      barColor: 'bg-accent-600',
    },
    {
      label: 'Ganancia estimada',
      value: data.profitMonth !== null ? fmtArs(data.profitMonth) : '—',
      icon: Receipt,
      accentClass: 'text-primary-600',
      barColor: 'bg-primary-600',
      hidden: !isPro && data.profitMonth === null,
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
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className="min-w-0 rounded-2xl border border-border bg-surface-soft/40 p-4"
        >
          <div className={`mb-3 h-0.5 w-8 rounded-full ${card.barColor} opacity-70`} />
          <div className="flex items-start justify-between gap-2">
            <p className="text-[9px] font-black uppercase leading-tight tracking-widest text-text-subtle">
              {card.label}
            </p>
            <card.icon size={14} className={`${card.accentClass} mt-0.5 shrink-0`} strokeWidth={2.5} />
          </div>
          <p className="mt-2 truncate font-mono text-xl font-black tracking-tighter text-text-main sm:text-2xl">
            {card.value}
          </p>
        </article>
      ))}
    </div>
  )
}
