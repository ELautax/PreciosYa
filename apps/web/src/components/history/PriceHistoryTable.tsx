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
      <h3 className="text-sm font-medium text-stone-800">Tabla de cambios</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs text-stone-500">
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Motivo</th>
              <th className="px-2 py-2">Costo</th>
              <th className="px-2 py-2">Margen</th>
              <th className="px-2 py-2">Venta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-stone-100">
                <td className="px-2 py-2 text-stone-700">{fmtDate(r.recordedAt)}</td>
                <td className="px-2 py-2">
                  <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                    {reasonLabel(r.changeReason)}
                  </span>
                </td>
                <td className="mono px-2 py-2 text-stone-800">${r.cost.toFixed(2)}</td>
                <td className="mono px-2 py-2 text-stone-800">{r.marginPct.toFixed(2)}%</td>
                <td className="mono px-2 py-2 font-medium text-stone-900">${r.salePrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
