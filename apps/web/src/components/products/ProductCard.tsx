import type { ProductDto } from '@/types/product'

import { MarginBadge } from './MarginBadge'

type ProductCardProps = {
  product: ProductDto
  onEdit: (p: ProductDto) => void
  onDelete: (p: ProductDto) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <article className="surface-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-stone-900">{product.name}</h3>
          <p className="text-sm text-stone-500">
            {product.unit}
            {product.barcode ? ` · ${product.barcode}` : ''}
          </p>
        </div>
        <MarginBadge marginPct={product.marginPct} isAlert={product.isMarginAlert} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-sm text-stone-500">Costo</dt>
          <dd className="mono font-medium">${product.cost.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-sm text-stone-500">Venta</dt>
          <dd className="mono font-medium">${product.salePrice.toFixed(2)}</dd>
        </div>
      </dl>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="btn-soft"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          Dar de baja
        </button>
      </div>
    </article>
  )
}
