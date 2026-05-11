import type { ProductDto } from '@/types/product'

import { ProductCard } from './ProductCard'

type ProductListProps = {
  products: ProductDto[]
  onEdit: (p: ProductDto) => void
  onDelete: (p: ProductDto) => void
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="surface-card border-dashed p-8 text-center text-sm text-stone-600">
        No hay productos. Creá el primero con &quot;Nuevo producto&quot;.
      </p>
    )
  }

  return (
    <>
      <div className="hidden xl:block">
        <div className="surface-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3">Costo</th>
                <th className="px-4 py-3">Venta</th>
                <th className="px-4 py-3">Margen</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-stone-900">{p.name}</td>
                  <td className="px-4 py-3 text-stone-600">{p.unit}</td>
                  <td className="mono px-4 py-3 text-stone-800">${p.cost.toFixed(2)}</td>
                  <td className="mono px-4 py-3 font-medium text-stone-900">${p.salePrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <MarginCell marginPct={p.marginPct} isAlert={p.isMarginAlert} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => onEdit(p)} className="btn-soft">
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        Dar de baja
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:hidden">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  )
}

function MarginCell({ marginPct, isAlert }: { marginPct: number; isAlert: boolean }) {
  const tone = isAlert
    ? 'border-red-200 bg-red-50 text-red-800'
    : 'border-green-300 bg-green-50 text-green-900'
  return (
    <span className={`mono inline-flex rounded-full border px-2 py-1 text-sm font-medium ${tone}`}>
      {marginPct.toFixed(1)}%
    </span>
  )
}
