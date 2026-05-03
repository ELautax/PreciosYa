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
      <p className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-600">
        No hay productos. Creá el primero con &quot;Nuevo producto&quot;.
      </p>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  )
}
