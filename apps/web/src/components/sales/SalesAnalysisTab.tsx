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
  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-black text-text-main">{title}</h3>
      </div>
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-6 text-center text-text-subtle">
                  Sin datos en este período
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="border-b border-border/60 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 font-semibold text-text-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SalesAnalysisTab({ localId, period, isPro }: SalesAnalysisTabProps) {
  const topQ = useTopProducts({ localId, period, enabled: isPro })
  const stagnantQ = useStagnantProducts(localId, isPro)
  const promoteQ = usePromoteProducts({ localId, period, enabled: isPro })
  const starQ = useStarProducts({ localId, period, enabled: isPro })
  const categoryQ = useCategoryPerformance({ localId, period, enabled: isPro })

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
