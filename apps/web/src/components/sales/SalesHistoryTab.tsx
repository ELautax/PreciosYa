import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { fmtArsDecimal } from '@/components/sales/format'
import { useSalesList } from '@/hooks/useSales'
import type { SaleDto } from '@/types/sales'

type SalesHistoryTabProps = {
  localId: string
}

function formatSoldAt(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SaleDetail({ sale }: { sale: SaleDto }) {
  return (
    <div className="mt-3 space-y-2 rounded-xl border border-border bg-surface-soft p-3">
      {sale.lines.map((line) => (
        <div key={line.id} className="flex justify-between gap-2 text-xs">
          <span className="font-semibold text-text-main">
            {line.quantity}× {line.productName}
          </span>
          <span className="font-mono font-bold text-text-muted">{fmtArsDecimal(line.lineRevenue)}</span>
        </div>
      ))}
      {sale.note ? (
        <p className="text-[10px] font-medium text-text-subtle border-t border-border pt-2">{sale.note}</p>
      ) : null}
    </div>
  )
}

export function SalesHistoryTab({ localId }: SalesHistoryTabProps) {
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const listQ = useSalesList(localId, { page, limit: 15 })

  if (listQ.isLoading) {
    return <div className="skeleton h-48 w-full rounded-2xl" />
  }

  if (!listQ.data?.items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-12 text-center">
        <p className="text-sm font-bold text-text-subtle">Todavía no hay ventas registradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {listQ.data.items.map((sale) => {
        const open = expandedId === sale.id
        return (
          <article key={sale.id} className="surface-card p-4">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => setExpandedId(open ? null : sale.id)}
            >
              <div>
                <p className="text-sm font-black text-text-main">{formatSoldAt(sale.soldAt)}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-subtle">
                  {sale.unitsSold} unidades · {sale.lines.length} ítems
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-primary-600">
                  {fmtArsDecimal(sale.totalRevenue)}
                </span>
                <ChevronRight
                  size={16}
                  className={`text-text-subtle transition-transform ${open ? 'rotate-90' : ''}`}
                />
              </div>
            </button>
            {open ? <SaleDetail sale={sale} /> : null}
          </article>
        )
      })}

      {listQ.data.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary px-4 text-xs"
          >
            Anterior
          </button>
          <span className="flex items-center text-xs font-bold text-text-subtle">
            {page} / {listQ.data.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= listQ.data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary px-4 text-xs"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
