import { Edit3, Trash2, Package2, DollarSign, Percent } from 'lucide-react'
import type { ProductDto } from '@/types/product'
import { ProductCard } from './ProductCard'
import { MarginBadge } from './MarginBadge'

type ProductListProps = {
  products: ProductDto[]
  onEdit: (p: ProductDto) => void
  onDelete: (p: ProductDto) => void
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Desktop Table View */}
      <div className="hidden xl:block">
        <div className="surface-card overflow-hidden border-border/50">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-soft/40">
                <th className="px-6 py-4">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-subtle">
                      <Package2 size={14} className="text-primary-600" />
                      Producto
                   </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">Unidad</th>
                <th className="px-6 py-4">
                   <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-text-subtle">
                      <DollarSign size={14} className="text-primary-600" />
                      Costo
                   </div>
                </th>
                <th className="px-6 py-4">
                   <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-text-subtle">
                      <DollarSign size={14} className="text-primary-600" />
                      Venta
                   </div>
                </th>
                <th className="px-6 py-4">
                   <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-text-subtle">
                      <Percent size={14} className="text-primary-600" />
                      Margen
                   </div>
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-text-subtle">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.map((p) => (
                <tr key={p.id} className="group hover:bg-primary-50/10 transition-colors">
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-extrabold text-text-main group-hover:text-primary-600 transition-colors">{p.name}</p>
                      {p.barcode && <p className="mt-1 font-mono text-[10px] font-bold text-text-subtle tracking-tighter opacity-70">{p.barcode}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className="inline-flex rounded-lg bg-surface-soft px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-text-muted border border-border/30">
                        {p.unit}
                     </span>
                  </td>
                  <td className="px-6 py-5 font-mono font-bold text-text-muted">
                    ${p.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 font-mono font-black text-text-main">
                    ${p.salePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-5">
                    <MarginBadge
                      marginPct={p.marginPct}
                      marginStatus={p.marginStatus}
                      isAlert={p.isMarginAlert}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => onEdit(p)} 
                        className="btn-secondary h-10 px-3 gap-2 border-none bg-surface-soft hover:bg-primary-600 hover:text-white shadow-none transition-all"
                      >
                        <Edit3 size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Gestionar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-danger-600 bg-danger-50/50 hover:bg-danger-600 hover:text-white transition-all active:scale-90"
                        title="Dar de baja"
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card Grid View */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:hidden">
        {products.map((p) => (
          <li key={p.id} className="h-full">
            <ProductCard product={p} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </div>
  )
}
