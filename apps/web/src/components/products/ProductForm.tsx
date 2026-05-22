import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X, Save, Box, Tag, FileText, Layout, DollarSign, Percent, BadgeDollarSign, Info } from 'lucide-react'

import { useCategories } from '@/hooks/useCategories'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import type { ProductDto } from '@/types/product'

const schema = z.object({
  name: z.string().min(1, 'Nombre obligatorio'),
  cost: z.number().positive('Costo debe ser mayor que 0'),
  marginPct: z.number().min(0, 'Margen no puede ser negativo'),
  categoryId: z.string().optional(),
  unit: z.string().optional(),
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
  const categoriesQuery = useCategories(localId)
  const createMut = useCreateProduct()
  const updateMut = useUpdateProduct(localId)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      cost: 0,
      marginPct: 20,
      categoryId: '',
      unit: 'unidad',
      barcode: '',
      notes: '',
    },
  })

  const watchedCost = watch('cost') || 0
  const watchedMargin = watch('marginPct') || 0
  const salePricePreview = watchedCost * (1 + watchedMargin / 100)

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        cost: product.cost,
        marginPct: product.marginPct,
        categoryId: product.categoryId ?? '',
        unit: product.unit,
        barcode: product.barcode ?? '',
        notes: product.notes ?? '',
      })
    }
  }, [product, reset])

  async function onSubmit(values: FormValues): Promise<void> {
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center animate-fade-in backdrop-blur-sm">
      <div
        className="surface-card flex flex-col max-h-[90vh] w-full max-w-lg overflow-hidden animate-slide-up shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-5">
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

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
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
                <div className="flex flex-col items-end gap-1">
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
              <select className="w-full" {...register('categoryId')}>
                <option value="">Sin categoría asignada</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
                <input 
                  className="w-full" 
                  placeholder="Ej. unidad, kg, litro"
                  {...register('unit')} 
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                   <Tag size={14} className="text-primary-600" />
                   Código de Barras
                </label>
                <input 
                  className="w-full font-mono" 
                  placeholder="Opcional"
                  {...register('barcode')} 
                />
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
        <div className="flex items-center gap-3 border-t border-border bg-surface px-6 py-6">
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
               {product ? 'Guardar Cambios' : 'Registrar Producto'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
