import { Trash2 } from 'lucide-react'

import { fmtArsDecimal } from '@/components/sales/format'
import { SaleQuantityStepper } from '@/components/sales/SaleQuantityStepper'
import type { SaleDraftItem } from '@/types/sales'

type SaleRegisterDraftProps = {
  items: SaleDraftItem[]
  onChangeQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function SaleRegisterDraft({ items, onChangeQuantity, onRemove }: SaleRegisterDraftProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-10 text-center">
        <p className="text-sm font-bold text-text-subtle">Escaneá o buscá productos para armar la venta</p>
      </div>
    )
  }

  const total = items.reduce((s, i) => s + i.salePrice * i.quantity, 0)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.productId}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-soft p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-text-main">{item.name}</p>
            <p className="mt-1 text-xs font-semibold text-text-muted">
              {fmtArsDecimal(item.salePrice)} · {item.unit}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SaleQuantityStepper
              value={item.quantity}
              onChange={(q) => onChangeQuantity(item.productId, q)}
              step={item.unit === 'kg' || item.unit === 'lt' ? 0.5 : 1}
            />
            <button
              type="button"
              onClick={() => onRemove(item.productId)}
              className="rounded-full bg-danger-50 p-2 text-danger-600 dark:bg-danger-900/20"
              aria-label="Quitar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-2xl bg-primary-50/30 px-4 py-3 dark:bg-primary-900/10">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-subtle">Total estimado</span>
        <span className="font-mono text-lg font-black text-primary-700">{fmtArsDecimal(total)}</span>
      </div>
    </div>
  )
}
