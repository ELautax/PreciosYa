import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  X,
  Save,
  Box,
  Tag,
  FileText,
  Layout,
  DollarSign,
  Percent,
  BadgeDollarSign,
  Info,
  ScanLine,
} from 'lucide-react'
import { PRODUCT_UNITS, getMarginStatus } from 'shared'

import { BarcodeScanner } from '@/components/products/BarcodeScanner'
import { MarginBadge } from '@/components/products/MarginBadge'
import { useBarcodeLookup } from '@/hooks/useBarcodeLookup'
import { useCategories } from '@/hooks/useCategories'
import { useLocals } from '@/hooks/useLocals'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { categoryIndexBadgeClass, categoryIndexLabel } from '@/lib/categoryIndex'
import { appToast } from '@/lib/toast'
import type { ProductDto } from '@/types/product'
import { CategoryAvatar } from '@/lib/categoryUi'

const schema = z.object({
  name: z.string().min(1, 'Nombre obligatorio'),
  cost: z.number().positive('Costo debe ser mayor que 0'),
  marginPct: z.number().min(0, 'Margen no puede ser negativo'),
  categoryId: z.string().optional(),
  unit: z.enum(PRODUCT_UNITS).optional(),
  barcode: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type ProductFormProps = {
  localId: string
  product?: ProductDto | null
  onClose: () => void
}

export function ProductForm({ localId, product, onClose }: ProductFormProps) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const categoriesQuery = useCategories(localId, true, { refetchOnMount: true })
  const { data: locals } = useLocals()
  const local = locals?.find((l) => l.id === localId)
  const minMarginPct = local?.minMarginPct ?? 20
  const createMut = useCreateProduct()
  const updateMut = useUpdateProduct(localId)
  const barcodeLookupMut = useBarcodeLookup(localId)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      cost: 1,
      marginPct: 20,
      categoryId: '',
      unit: 'unidad',
      barcode: '',
      notes: '',
    },
  })

  const watchedCost = watch('cost') || 0
  const watchedMargin = watch('marginPct') || 0
  const watchedCategoryId = watch('categoryId')?.trim() ?? ''
  const selectedCategory = categoriesQuery.data?.find((c) => c.id === watchedCategoryId)
  const salePricePreview = watchedCost * (1 + watchedMargin / 100)
  const marginStatus = getMarginStatus(watchedMargin, minMarginPct)

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        cost: product.cost,
        marginPct: product.marginPct,
        categoryId: product.categoryId ?? '',
        unit: (PRODUCT_UNITS as readonly string[]).includes(product.unit)
          ? (product.unit as FormValues['unit'])
          : 'unidad',
        barcode: product.barcode ?? '',
        notes: product.notes ?? '',
      })
    }
  }, [product, reset])

  async function onSubmit(values: FormValues): Promise<void> {
    if (!localId) {
      appToast.error('Seleccioná un local antes de guardar el producto')
      return
    }

    const barcode =
      values.barcode?.trim() === '' ? null : values.barcode?.trim() ?? null
    const notes =
      values.notes?.trim() === '' ? null : values.notes?.trim() ?? null
    const categoryId =
      values.categoryId && values.categoryId.trim() !== ''
        ? values.categoryId
        : null

    if (product) {
      await updateMut.mutateAsync({
        id: product.id,
        body: {
          name: values.name,
          cost: values.cost,
          marginPct: values.marginPct,
          unit: values.unit || 'unidad',
          barcode,
          categoryId,
          notes,
        },
      })
    } else {
      await createMut.mutateAsync({
        localId,
        name: values.name,
        cost: values.cost,
        marginPct: values.marginPct,
        unit: values.unit || 'unidad',
        barcode,
        categoryId,
        notes,
      })
    }
    onClose()
  }

  const pending = createMut.isPending || updateMut.isPending

  async function handleBarcodeDetected(code: string): Promise<void> {
    setScannerOpen(false)
    setValue('barcode', code, { shouldDirty: true })

    try {
      const lookup = await barcodeLookupMut.mutateAsync(code)
      const currentName = watch('name')?.trim() ?? ''
      const currentUnit = watch('unit') ?? 'unidad'
      const currentCost = Number(watch('cost') ?? 0)
      const currentMargin = Number(watch('marginPct') ?? 20)
      const currentCategoryId = watch('categoryId')?.trim() ?? ''
      const currentNotes = watch('notes')?.trim() ?? ''

      if (lookup.name && currentName === '') {
        setValue('name', lookup.name, { shouldDirty: true })
      }
      if (lookup.unit && currentUnit === 'unidad') {
        setValue('unit', lookup.unit, { shouldDirty: true })
      }
      if (lookup.cost != null && lookup.cost > 0 && (!Number.isFinite(currentCost) || currentCost <= 0)) {
        setValue('cost', lookup.cost, { shouldDirty: true })
      }
      if (
        lookup.marginPct != null &&
        lookup.marginPct >= 0 &&
        (!Number.isFinite(currentMargin) || currentMargin === 20)
      ) {
        setValue('marginPct', lookup.marginPct, { shouldDirty: true })
      }
      if (lookup.categoryId && currentCategoryId === '') {
        setValue('categoryId', lookup.categoryId, { shouldDirty: true })
      }
      if (lookup.notes && currentNotes === '') {
        setValue('notes', lookup.notes, { shouldDirty: true })
      }

      if (lookup.source === 'local') {
        appToast.success('Producto existente en tu inventario — datos cargados')
      } else if (lookup.source === 'user_catalog') {
        appToast.success('Datos cargados desde otro local tuyo')
      } else if (lookup.source === 'shared_catalog') {
        appToast.success('Datos sugeridos desde el catálogo interno de PreciosYa')
      } else if (lookup.source === 'openfoodfacts') {
        appToast.success(
          lookup.brand
            ? `Datos desde catálogo (${lookup.brand})`
            : 'Nombre cargado desde catálogo de productos',
        )
      } else {
        appToast.info('Código guardado. Completá nombre y costo manualmente.')
      }
    } catch {
      /* toast en hook */
    }
  }

  return (
    <>
    <BarcodeScanner
      open={scannerOpen}
      onClose={() => setScannerOpen(false)}
      onDetected={(code) => {
        void handleBarcodeDetected(code)
      }}
    />
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4 animate-fade-in backdrop-blur-sm">
      <div
        className="surface-card flex flex-col max-h-[92vh] w-full max-w-lg overflow-hidden animate-slide-up shadow-2xl rounded-t-[2rem] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Handle */}
        <div className="mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-border-strong/40 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
                <Box size={20} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col">
                <h2 className="text-lg font-black tracking-tight text-text-main leading-none">
                  {product ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="mt-1.5 text-[10px] font-black text-text-subtle uppercase tracking-widest leading-none">
                   Módulo de Inventario
                </p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full bg-surface-soft p-2 text-text-subtle transition-all hover:bg-border active:scale-90"
            aria-label="Cerrar modal"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form 
          onSubmit={(e) => void handleSubmit(onSubmit)(e)} 
          className="flex-1 overflow-y-auto overscroll-contain p-6 pt-2 space-y-6 scrollbar-hide"
        >
          {/* Price Preview Card */}
          <div className="relative overflow-hidden rounded-2xl border border-primary-100 bg-primary-50/30 p-5 dark:border-primary-800/30 dark:bg-primary-900/10">
             <div className="absolute right-0 top-0 -translate-y-4 translate-x-4 opacity-10 text-primary-600">
                <BadgeDollarSign size={80} />
             </div>
             <div className="relative flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary-700 leading-none">Sugerencia de Venta</p>
                   <p className="mt-2 text-4xl font-black text-primary-600 font-mono tracking-tighter">
                      ${salePricePreview.toFixed(2)}
                   </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <MarginBadge marginPct={watchedMargin} marginStatus={marginStatus} />
                   <span className="inline-flex rounded-lg bg-white/50 px-2 py-1 text-[10px] font-black text-primary-700 dark:bg-black/20">
                      CALCULADO
                   </span>
                </div>
             </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                 <FileText size={14} className="text-primary-600" />
                 Nombre del Producto
              </label>
              <input
                className={`w-full ${errors.name ? 'border-danger-600 ring-4 ring-danger-600/10' : ''}`}
                placeholder="Ej. Coca Cola 500ml"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-[10px] font-bold text-danger-600 uppercase tracking-tight">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                 <Layout size={14} className="text-primary-600" />
                 Categoría
              </label>
              <select
                className="w-full"
                disabled={categoriesQuery.isLoading}
                {...register('categoryId')}
              >
                <option value="">Sin categoría asignada</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {!categoriesQuery.isLoading && (categoriesQuery.data?.length ?? 0) === 0 && (
                <p className="text-[10px] font-bold text-text-subtle leading-tight">
                  No hay rubros activos.{' '}
                  <Link to="/categories" className="text-primary-600 underline" onClick={onClose}>
                    Activá rubros en Categorías
                  </Link>
                </p>
              )}
              {selectedCategory ? (
                <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-soft/80 p-3">
                   <CategoryAvatar slug={selectedCategory.templateSlug} fallbackColor={selectedCategory.colorHex} size={16} />
                   <div className="flex-1">
                     <p className="text-[10px] font-bold leading-relaxed text-text-muted">
                      Este producto se actualiza con{' '}
                      <span
                        className={`inline-flex rounded-md border px-1.5 py-0.5 font-black uppercase tracking-tighter ${categoryIndexBadgeClass(selectedCategory.preferredIndex)}`}
                      >
                        {categoryIndexLabel(selectedCategory.preferredIndex)}
                      </span>
                      . Cambiá el índice en{' '}
                      <Link to="/categories" className="text-primary-600 underline" onClick={onClose}>
                        Rubros
                      </Link>
                      , no acá.
                    </p>
                   </div>
                </div>
              ) : (
                <p className="text-[10px] font-bold text-text-subtle leading-tight px-1">
                  Sin rubro: al aplicar IPC usa el índice general; no entra en ajustes USD.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                   <DollarSign size={14} className="text-primary-600" />
                   Costo de Compra
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={`w-full font-mono ${errors.cost ? 'border-danger-600 ring-4 ring-danger-600/10' : ''}`}
                  {...register('cost', { valueAsNumber: true })}
                />
                {errors.cost && (
                  <p className="mt-1 text-[10px] font-bold text-danger-600 uppercase tracking-tight">{errors.cost.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                   <Percent size={14} className="text-primary-600" />
                   Margen (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={`w-full font-mono ${errors.marginPct ? 'border-danger-600 ring-4 ring-danger-600/10' : ''}`}
                  {...register('marginPct', { valueAsNumber: true })}
                />
                {errors.marginPct && (
                  <p className="mt-1 text-[10px] font-bold text-danger-600 uppercase tracking-tight">{errors.marginPct.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                   <Box size={14} className="text-primary-600" />
                   Unidad
                </label>
                <select className="w-full" {...register('unit')}>
                  {PRODUCT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                   <Tag size={14} className="text-primary-600" />
                   Código de Barras
                </label>
                <div className="flex gap-2">
                  <input
                    className="min-w-0 flex-1 font-mono"
                    placeholder="Opcional"
                    {...register('barcode')}
                  />
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="btn-secondary shrink-0 px-3"
                    title="Escanear con cámara"
                  >
                    <ScanLine size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                 <FileText size={14} className="text-primary-600" />
                 Notas e Información Adicional
              </label>
              <textarea
                rows={2}
                className="w-full resize-none scrollbar-hide"
                placeholder="Proveedor, ubicación en góndola, etc."
                {...register('notes')}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 rounded-xl bg-surface-soft p-3">
             <Info size={16} className="text-primary-600 shrink-0" />
             <p className="text-[10px] font-bold text-text-subtle leading-tight">
                El precio de venta se actualiza automáticamente al cambiar el costo o el margen de ganancia.
             </p>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center gap-3 border-t border-border bg-surface px-6 py-6 pb-safe sm:pb-6">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 h-12 text-xs font-black uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            onClick={() => void handleSubmit(onSubmit)()}
            className="btn-primary flex-[1.5] h-12 gap-2 shadow-xl shadow-primary-600/20 active:scale-95 transition-all"
          >
            <Save size={18} strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-widest">
               {product ? 'Guardar Cambios' : 'Registrar'}
            </span>
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
