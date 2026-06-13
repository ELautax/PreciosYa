import { DollarSign, Package, Receipt, TrendingUp, ShoppingBag } from 'lucide-react'

import { fmtArs } from '@/components/sales/format'
import type { SalesDashboardDto } from '@/types/sales'

type SalesKpiGridProps = {
  data: SalesDashboardDto
  isPro: boolean
}

export function SalesKpiGrid({ data, isPro }: SalesKpiGridProps) {
  const cards = [
    { label: 'Ventas hoy', value: fmtArs(data.salesToday), icon: DollarSign, accent: 'text-primary-600' },
    {
      label: isPro ? 'Ventas mes' : 'Ventas período',
      value: fmtArs(isPro ? data.salesMonth : data.totalRevenue),
      icon: TrendingUp,
      accent: 'text-accent-600',
    },
    {
      label: 'Ganancia estimada',
      value: data.profitMonth !== null ? fmtArs(data.profitMonth) : '—',
      icon: Receipt,
      accent: 'text-primary-600',
      hidden: !isPro && data.profitMonth === null,
    },
    { label: 'Unidades', value: String(data.unitsSold), icon: Package, accent: 'text-primary-600' },
    {
      label: 'Ticket promedio',
      value: fmtArs(data.averageTicket),
      icon: ShoppingBag,
      accent: 'text-accent-600',
    },
  ].filter((c) => !c.hidden)

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <article key={card.label} className="surface-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-text-subtle">{card.label}</p>
            <card.icon size={16} className={card.accent} strokeWidth={2.5} />
          </div>
          <p className="mt-2 font-mono text-xl font-black tracking-tighter text-text-main">{card.value}</p>
        </article>
      ))}
    </div>
  )
}
