import { Edit3, Trash2, Tag, Package2, BadgeDollarSign, History } from 'lucide-react'
import { Link } from 'react-router-dom'
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
    <article className="surface-card group relative flex h-full flex-col p-4 sm:p-6 animate-fade-in transition-all duration-300 hover:border-primary-600/30">
      {/* Acento superior sin overflow-hidden en toda la card (evita recortar badge/botones) */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl ${
          product.isMarginAlert
            ? 'bg-danger-600'
            : 'bg-primary-600 opacity-0 transition-opacity group-hover:opacity-100'
        }`}
      />

      <div className="mb-5 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-black leading-tight text-text-main transition-colors group-hover:text-primary-600">
            {product.name}
          </h3>
          <div className="mt-2 flex flex-col items-start gap-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-text-subtle">
                <Package2 size={12} strokeWidth={2.5} className="text-primary-600" />
                <span>{product.unit}</span>
              </div>
              {product.barcode && (
                <div className="flex min-w-0 items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-text-subtle">
                  <Tag size={12} strokeWidth={2.5} className="shrink-0 text-accent-600" />
                  <span className="truncate font-mono">{product.barcode}</span>
                </div>
              )}
            </div>
            {product.categoryName ? (
              <div className="flex max-w-full items-center gap-1.5">
                <CategoryAvatar
                  slug={category?.templateSlug ?? null}
                  fallbackColor={category?.colorHex}
                  size={10}
                />
                <span
                  className={`inline-flex max-w-full truncate rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${categoryIndexBadgeClass(product.categoryPreferredIndex)}`}
                >
                  {product.categoryName}
                </span>
              </div>
            ) : (
              <span className="inline-flex rounded-lg border border-warning-200 bg-warning-50 px-2 py-0.5 text-[9px] font-bold text-warning-800 dark:border-warning-800/40 dark:bg-warning-900/20 dark:text-warning-300">
                Sin rubro
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 pt-0.5">
          <MarginBadge
            marginPct={product.marginPct}
            marginStatus={product.marginStatus}
            isAlert={product.isMarginAlert}
          />
        </div>
      </div>

      <div className="mb-6 mt-auto grid grid-cols-2 gap-2 sm:gap-3">
        <div className="flex flex-col rounded-2xl border border-border/50 bg-surface-soft p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-text-subtle/30" />
            <p className="truncate text-[9px] font-black uppercase leading-none tracking-widest text-text-subtle sm:text-[10px]">
              Costo
            </p>
          </div>
          <p className="font-mono text-sm font-bold leading-none text-text-muted sm:text-base">
            ${product.cost.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-col rounded-2xl border border-primary-100 bg-primary-50/50 p-3 sm:p-4 dark:border-primary-800/30 dark:bg-primary-900/10">
          <div className="mb-2 flex items-center gap-1.5">
            <BadgeDollarSign size={12} strokeWidth={3} className="text-primary-600" />
            <p className="truncate text-[9px] font-black uppercase leading-none tracking-widest text-primary-700 sm:text-[10px]">
              P. Venta
            </p>
          </div>
          <p className="font-mono text-sm font-black leading-none text-primary-600 sm:text-base">
            ${product.salePrice.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 gap-2">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="btn-secondary h-12 min-w-0 flex-1 gap-2 shadow-sm border-border-strong/50 hover:border-primary-600 hover:text-primary-600 active:scale-95"
        >
          <Edit3 size={16} strokeWidth={2.5} className="shrink-0" />
          <span className="truncate text-xs font-bold">Editar</span>
        </button>
        <Link
          to={`/history?product=${product.id}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-soft text-text-muted transition-all hover:border-primary-300 hover:text-primary-600 active:scale-95"
          aria-label="Ver historial de precios"
          title="Historial de precios"
        >
          <History size={18} strokeWidth={2.5} />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-danger-50/50 text-danger-600 shadow-sm transition-all hover:bg-danger-600 hover:text-white active:scale-95 dark:bg-danger-900/10"
          aria-label="Dar de baja"
        >
          <Trash2 size={20} strokeWidth={2} />
        </button>
      </div>
    </article>
  )
}
