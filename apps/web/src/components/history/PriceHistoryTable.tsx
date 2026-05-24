import type { ProductHistoryEntryDto } from '@/types/product'

type PriceHistoryTableProps = {
  rows: ProductHistoryEntryDto[]
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('es-AR')
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
    <div className="surface-card p-4">
      <h3 className="text-sm font-extrabold text-text-main">Tabla de cambios</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-black uppercase tracking-widest text-text-subtle">
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Motivo</th>
              <th className="px-2 py-2">Costo</th>
              <th className="px-2 py-2">Margen</th>
              <th className="px-2 py-2">Venta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60">
                <td className="px-2 py-2 text-text-muted">{fmtDate(r.recordedAt)}</td>
                <td className="px-2 py-2">
                  <span className="rounded-lg bg-surface-soft px-2 py-0.5 text-xs font-bold text-text-muted">
                    {reasonLabel(r.changeReason)}
                  </span>
                </td>
                <td className="font-mono px-2 py-2 text-text-main">${r.cost.toFixed(2)}</td>
                <td className="font-mono px-2 py-2 text-text-main">{r.marginPct.toFixed(2)}%</td>
                <td className="font-mono px-2 py-2 font-bold text-text-main">${r.salePrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
