import type { SalesPeriod } from 'shared'

import { PlanUpgradeBanner } from '@/components/sales/PlanUpgradeBanner'
import { SalesByCategoryChart } from '@/components/sales/SalesByCategoryChart'
import { SalesKpiGrid } from '@/components/sales/SalesKpiGrid'
import { SalesPeriodFilter } from '@/components/sales/SalesPeriodFilter'
import { SalesTrendChart } from '@/components/sales/SalesTrendChart'
import { useSalesDashboard } from '@/hooks/useSales'

type SalesSummaryTabProps = {
  localId: string
  period: SalesPeriod
  onPeriodChange: (period: SalesPeriod) => void
  isPro: boolean
}

export function SalesSummaryTab({
  localId,
  period,
  onPeriodChange,
  isPro,
}: SalesSummaryTabProps) {
  const dashQ = useSalesDashboard({ localId, period })

  if (dashQ.isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-full rounded-2xl" />
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!dashQ.data) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm font-bold text-text-subtle">
        No pudimos cargar el resumen
      </div>
    )
  }

  const profitPoints = dashQ.data.profitTrend.map((p) => ({ date: p.date, revenue: p.profit }))

  return (
    <div className="space-y-6">
      <SalesPeriodFilter value={period} onChange={onPeriodChange} isPro={isPro} />

      {!isPro && period !== 'today' && period !== '7d' ? (
        <PlanUpgradeBanner message="En Free podés ver resumen de hoy y últimos 7 días." />
      ) : null}

      <SalesKpiGrid data={dashQ.data} isPro={isPro} />

      <SalesTrendChart title="Ventas en el período" points={dashQ.data.revenueTrend} />

      {isPro && profitPoints.length > 0 ? (
        <SalesTrendChart title="Ganancia estimada" points={profitPoints} />
      ) : !isPro ? (
        <PlanUpgradeBanner title="Ganancia y tendencias Pro" message="El gráfico de ganancia está disponible en plan Pro." />
      ) : null}

      {dashQ.data.categoryBreakdown.length > 0 ? (
        <SalesByCategoryChart items={dashQ.data.categoryBreakdown} />
      ) : null}
    </div>
  )
}
