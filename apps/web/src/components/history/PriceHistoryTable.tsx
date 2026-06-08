import type { ProductHistoryEntryDto } from '@/types/product'

type PriceHistoryTableProps = {
  rows: ProductHistoryEntryDto[]
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function reasonLabel(reason: string): string {
  switch (reason) {
    case 'IPC_INDEC':
      return 'IPC'
    case 'BULK_PCT':
      return 'Aumento %'
    case 'MANUAL':
      return 'Manual'
    case 'IMPORT':
      return 'Importación'
    default:
      return reason
  }
}

export function PriceHistoryTable({ rows }: PriceHistoryTableProps) {
  return (
    <div className="surface-card p-4 sm:p-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Tabla de cambios</h3>
      
      {/* Mobile view */}
      <div className="mt-4 grid gap-3 md:hidden">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-surface-soft/50 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest">{fmtDate(r.recordedAt)}</span>
              <span className="rounded-lg bg-surface px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-text-muted border border-border">
                {reasonLabel(r.changeReason)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[9px] font-bold text-text-subtle uppercase">Costo</p>
                <p className="font-mono text-sm font-black text-text-main">${r.cost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-text-subtle uppercase">Margen</p>
                <p className="font-mono text-sm font-black text-text-main">{r.marginPct.toFixed(2)}%</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-text-subtle uppercase">Venta</p>
                <p className="font-mono text-sm font-black text-primary-600">${r.salePrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="mt-3 hidden md:block overflow-x-auto">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-xs font-black uppercase tracking-widest text-text-subtle">
              <th className="px-4 py-4">Fecha</th>
              <th className="px-4 py-4">Motivo</th>
              <th className="px-4 py-4">Costo</th>
              <th className="px-4 py-4">Margen</th>
              <th className="px-4 py-4">Venta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-primary-50/5 transition-colors">
                <td className="px-4 py-4 text-text-muted">{fmtDate(r.recordedAt)}</td>
                <td className="px-4 py-4">
                  <span className="rounded-lg bg-surface-soft px-2 py-0.5 text-xs font-bold text-text-muted">
                    {reasonLabel(r.changeReason)}
                  </span>
                </td>
                <td className="font-mono px-4 py-4 text-text-main">${r.cost.toFixed(2)}</td>
                <td className="font-mono px-4 py-4 text-text-main">{r.marginPct.toFixed(2)}%</td>
                <td className="font-mono px-4 py-4 font-black text-primary-600">${r.salePrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
