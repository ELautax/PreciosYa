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
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <article key={card.label} className="surface-card overflow-hidden p-3 sm:p-4">
          {/* Accent bar */}
          <div className={`mb-3 h-0.5 w-8 rounded-full ${card.barColor} opacity-70`} />
          <div className="flex items-start justify-between gap-1">
            <p className="text-[9px] font-black uppercase leading-tight tracking-widest text-text-subtle">
              {card.label}
            </p>
            <card.icon size={14} className={`${card.accentClass} shrink-0 mt-0.5`} strokeWidth={2.5} />
          </div>
          <p className="mt-2 font-mono text-xl font-black tracking-tighter text-text-main sm:text-2xl">
            {card.value}
          </p>
        </article>
      ))}
    </div>
  )
}
