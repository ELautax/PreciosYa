import type { SalesPeriod } from 'shared'

import { fmtArsDecimal } from '@/components/sales/format'
import { PlanUpgradeBanner } from '@/components/sales/PlanUpgradeBanner'
import { SalesPeriodFilter } from '@/components/sales/SalesPeriodFilter'
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
  onPeriodChange: (period: SalesPeriod) => void
  customFrom: string
  customTo: string
  onCustomFromChange: (v: string) => void
  onCustomToChange: (v: string) => void
  isPro: boolean
}

const PERIOD_LABEL: Record<SalesPeriod, string> = {
  today: 'Hoy',
  '7d': '7 días',
  '30d': '30 días',
  '90d': '90 días',
  month: 'Este mes',
  custom: 'Personalizado',
}

function AnalysisTable({
  title,
  hint,
  headers,
  rows,
}: {
  title: string
  hint?: string
  headers: string[]
  rows: (string | number)[][]
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-soft/30 p-4">
        <h3 className="text-sm font-black text-text-main">{title}</h3>
        {hint ? <p className="mt-1 text-xs font-medium text-text-subtle">{hint}</p> : null}
        <p className="mt-4 py-4 text-center text-xs font-semibold text-text-subtle">
          Sin datos en este período
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-3">
      <div>
        <h3 className="text-sm font-black text-text-main">{title}</h3>
        {hint ? <p className="mt-1 text-xs font-medium text-text-subtle">{hint}</p> : null}
      </div>
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
                  <dt className="font-bold text-text-subtle">{header}</dt>
                  <dd className="font-mono font-bold text-text-muted">{row[ci + 1]}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <div className="surface-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-soft">
                {headers.map((h) => (
                  <th key={h} className="px-4 py-3 font-bold text-text-subtle">
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
  onPeriodChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
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
    return (
      <div className="space-y-4">
        <PlanUpgradeBanner
          title="Análisis de ventas (Pro)"
          message="Con Pro ves top productos, estancados, promociones y ventas por rubro. En Free podés registrar ventas y ver el resumen de 7 días."
        />
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <div className="pointer-events-none select-none blur-[2px] opacity-60" aria-hidden>
            <AnalysisTable
              title="Más vendidos (ejemplo)"
              headers={['Producto', 'Unidades']}
              rows={[
                ['Gaseosa 2.25L', 42],
                ['Yerba 1kg', 28],
                ['Aceite 900ml', 19],
              ]}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-canvas/40 px-4 backdrop-blur-[1px]">
            <p className="rounded-full border border-border bg-surface px-4 py-2 text-center text-xs font-bold text-text-main shadow-sm">
              Vista previa · disponible en Pro
            </p>
          </div>
        </div>
      </div>
    )
  }

  const loading =
    topQ.isLoading || stagnantQ.isLoading || promoteQ.isLoading || starQ.isLoading || categoryQ.isLoading

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-text-muted">
            Período: <span className="text-text-main">{PERIOD_LABEL[period]}</span>
          </p>
        </div>
        <SalesPeriodFilter value={period} onChange={onPeriodChange} isPro={isPro} />
        {period === 'custom' ? (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className="h-11"
            />
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              className="h-11"
            />
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="skeleton h-64 w-full rounded-2xl" />
      ) : (
        <>
          <AnalysisTable
            title="Más vendidos (unidades)"
            hint="Qué más salió en el período."
            headers={['Producto', 'Unidades']}
            rows={(topQ.data?.byUnits ?? []).map((p) => [p.productName, p.units])}
          />

          <AnalysisTable
            title="Más rentables"
            hint="Mayor ganancia estimada (venta − costo al momento)."
            headers={['Producto', 'Ganancia']}
            rows={(topQ.data?.byProfit ?? []).map((p) => [p.productName, fmtArsDecimal(p.profit)])}
          />

          <AnalysisTable
            title="Productos estancados"
            hint="Hace tiempo que no se venden: candidatos a promo o baja."
            headers={['Producto', 'Última venta']}
            rows={(stagnantQ.data?.items ?? []).slice(0, 10).map((p) => [
              p.productName,
              p.daysSinceLastSale === null ? 'Nunca' : `hace ${p.daysSinceLastSale} días`,
            ])}
          />

          <AnalysisTable
            title="Para promocionar"
            hint="Buen margen pero pocas unidades: conviene empujar."
            headers={['Producto', 'Margen', 'Unidades']}
            rows={(promoteQ.data?.items ?? []).map((p) => [
              p.productName,
              `${p.marginPct.toFixed(1)}%`,
              p.units,
            ])}
          />

          <AnalysisTable
            title="Productos estrella"
            hint="Venden bien y dejan buena ganancia."
            headers={['Producto', 'Ganancia', 'Unidades']}
            rows={(starQ.data?.items ?? []).map((p) => [
              `${p.productName} ★`,
              fmtArsDecimal(p.profit),
              p.units,
            ])}
          />

          <AnalysisTable
            title="Ventas por rubro"
            hint="Cómo rinde cada rubro del catálogo."
            headers={['Rubro', 'Ventas', 'Ganancia']}
            rows={(categoryQ.data?.items ?? []).map((c) => [
              c.categoryName,
              fmtArsDecimal(c.revenue),
              fmtArsDecimal(c.profit),
            ])}
          />
        </>
      )}
    </div>
  )
}
