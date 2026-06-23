import type { SalesPeriod } from 'shared'

import { fmtArsDecimal } from '@/components/sales/format'
import { PlanUpgradeBanner } from '@/components/sales/PlanUpgradeBanner'
import {
  useCategoryPerformance,
  usePromoteProducts,
  useStagnantProducts,
  useStarProducts,
  useTopProducts,
} from '@/hooks/useSales'

type SalesAnalysisTabProps = {
  localId: string
  period: SalesPeriod
  customFrom: string
  customTo: string
  isPro: boolean
}

function AnalysisTable({
  title,
  headers,
  rows,
}: {
  title: string
  headers: string[]
  rows: (string | number)[][]
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-soft/30 p-4">
        <h3 className="text-sm font-black text-text-main">{title}</h3>
        <p className="mt-4 py-4 text-center text-xs font-semibold text-text-subtle">
          Sin datos en este período
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-3">
      <h3 className="text-sm font-black text-text-main">{title}</h3>
      {/* Mobile: cards */}
      <div className="space-y-2 md:hidden">
        {rows.map((row, idx) => (
          <article
            key={idx}
            className="rounded-2xl border border-border bg-surface-soft/40 p-4"
          >
            <p className="text-sm font-bold text-text-main">{row[0]}</p>
            <dl className="mt-2 grid gap-1">
              {headers.slice(1).map((header, ci) => (
                <div key={header} className="flex items-center justify-between gap-2 text-xs">
                  <dt className="font-black uppercase tracking-widest text-text-subtle">{header}</dt>
                  <dd className="font-mono font-bold text-text-muted">{row[ci + 1]}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      {/* Desktop: table */}
      <div className="surface-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-soft">
                {headers.map((h) => (
                  <th key={h} className="px-4 py-3 font-black uppercase tracking-widest text-text-subtle">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-border/60 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 font-semibold text-text-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function SalesAnalysisTab({
  localId,
  period,
  customFrom,
  customTo,
  isPro,
}: SalesAnalysisTabProps) {
  const periodParams = {
    localId,
    period,
    ...(period === 'custom' && customFrom && customTo
      ? { from: customFrom, to: customTo }
      : {}),
    enabled: isPro,
  }

  const topQ = useTopProducts(periodParams)
  const stagnantQ = useStagnantProducts(localId, isPro)
  const promoteQ = usePromoteProducts(periodParams)
  const starQ = useStarProducts(periodParams)
  const categoryQ = useCategoryPerformance(periodParams)

  if (!isPro) {
    return <PlanUpgradeBanner />
  }

  const loading =
    topQ.isLoading || stagnantQ.isLoading || promoteQ.isLoading || starQ.isLoading || categoryQ.isLoading

  if (loading) {
    return <div className="skeleton h-64 w-full rounded-2xl" />
  }

  return (
    <div className="space-y-6">
      <AnalysisTable
        title="Más vendidos (unidades)"
        headers={['Producto', 'Unidades']}
        rows={(topQ.data?.byUnits ?? []).map((p) => [p.productName, p.units])}
      />

      <AnalysisTable
        title="Más rentables"
        headers={['Producto', 'Ganancia']}
        rows={(topQ.data?.byProfit ?? []).map((p) => [p.productName, fmtArsDecimal(p.profit)])}
      />

      <AnalysisTable
        title="Productos estancados"
        headers={['Producto', 'Última venta']}
        rows={(stagnantQ.data?.items ?? []).slice(0, 10).map((p) => [
          p.productName,
          p.daysSinceLastSale === null ? 'Nunca' : `hace ${p.daysSinceLastSale} días`,
        ])}
      />

      <AnalysisTable
        title="Para promocionar"
        headers={['Producto', 'Margen', 'Unidades']}
        rows={(promoteQ.data?.items ?? []).map((p) => [
          p.productName,
          `${p.marginPct.toFixed(1)}%`,
          p.units,
        ])}
      />

      <AnalysisTable
        title="Productos estrella"
        headers={['Producto', 'Ganancia', 'Unidades']}
        rows={(starQ.data?.items ?? []).map((p) => [
          `${p.productName} ★`,
          fmtArsDecimal(p.profit),
          p.units,
        ])}
      />

      <AnalysisTable
        title="Ventas por rubro"
        headers={['Rubro', 'Ventas', 'Ganancia']}
        rows={(categoryQ.data?.items ?? []).map((c) => [
          c.categoryName,
          fmtArsDecimal(c.revenue),
          fmtArsDecimal(c.profit),
        ])}
      />
    </div>
  )
}
