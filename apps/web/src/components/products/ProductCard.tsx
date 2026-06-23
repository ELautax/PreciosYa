import { Edit3, Trash2, Tag, Package2, BadgeDollarSign } from 'lucide-react'
import type { ProductDto } from '@/types/product'
import { categoryIndexBadgeClass } from '@/lib/categoryIndex'
import { MarginBadge } from './MarginBadge'
import { CategoryAvatar } from '@/lib/categoryUi'
import type { CategoryDto } from '@/types/category'

type ProductCardProps = {
  product: ProductDto
  category?: CategoryDto
  onEdit: (p: ProductDto) => void
  onDelete: (p: ProductDto) => void
}

export function ProductCard({ product, category, onEdit, onDelete }: ProductCardProps) {
  return (
    <article className="surface-card group relative flex flex-col h-full overflow-hidden p-5 sm:p-6 animate-fade-in transition-all duration-300 hover:border-primary-600/30">
      {/* Visual Accent */}
      <div className={`absolute top-0 left-0 h-1 w-full ${product.isMarginAlert ? 'bg-danger-600' : 'bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity'}`} />

      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-text-main leading-tight truncate transition-colors group-hover:text-primary-600">
            {product.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
             <div className="flex items-center gap-1 text-[10px] font-extrabold text-text-subtle uppercase tracking-widest">
                <Package2 size={12} strokeWidth={2.5} className="text-primary-600" />
                <span>{product.unit}</span>
             </div>
             {product.barcode && (
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-text-subtle uppercase tracking-widest">
                   <Tag size={12} strokeWidth={2.5} className="text-accent-600" />
                   <span className="font-mono">{product.barcode}</span>
                </div>
             )}
              {product.categoryName && (
                 <div className="flex items-center gap-1.5">
                   <CategoryAvatar 
                     slug={category?.templateSlug ?? null} 
                     fallbackColor={category?.colorHex} 
                     size={10} 
                   />
                   <span
                     className={`inline-flex rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${categoryIndexBadgeClass(product.categoryPreferredIndex)}`}
                   >
                     {product.categoryName}
                   </span>
                 </div>
              )}
          </div>
        </div>
        <MarginBadge
          marginPct={product.marginPct}
          marginStatus={product.marginStatus}
          isAlert={product.isMarginAlert}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 mt-auto">
        <div className="flex flex-col rounded-2xl bg-surface-soft p-3 sm:p-4 border border-border/50">
           <div className="flex items-center gap-1.5 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-text-subtle/30" />
              <p className="text-[9px] sm:text-[10px] font-black text-text-subtle uppercase tracking-widest leading-none truncate">Costo</p>
           </div>
           <p className="font-mono text-sm sm:text-base font-bold text-text-muted leading-none">
              ${product.cost.toFixed(2)}
           </p>
        </div>
        <div className="flex flex-col rounded-2xl bg-primary-50/50 p-3 sm:p-4 border border-primary-100 dark:bg-primary-900/10 dark:border-primary-800/30">
           <div className="flex items-center gap-1.5 mb-2">
              <BadgeDollarSign size={12} strokeWidth={3} className="text-primary-600" />
              <p className="text-[9px] sm:text-[10px] font-black text-primary-700 uppercase tracking-widest leading-none truncate">P. Venta</p>
           </div>
           <p className="font-mono text-sm sm:text-base font-black text-primary-600 leading-none">
              ${product.salePrice.toFixed(2)}
           </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="btn-secondary flex-1 h-12 gap-2 shadow-sm border-border-strong/50 hover:border-primary-600 hover:text-primary-600 active:scale-95"
        >
          <Edit3 size={16} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-widest">Gestionar</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-danger-600 bg-danger-50/50 hover:bg-danger-600 hover:text-white transition-all active:scale-95 dark:bg-danger-900/10 shadow-sm"
          aria-label="Dar de baja"
        >
          <Trash2 size={20} strokeWidth={2} />
        </button>
      </div>
    </article>
  )
}
