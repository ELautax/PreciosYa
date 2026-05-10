import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
          unit: values.unit,
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
        unit: values.unit,
        barcode,
        categoryId,
        notes,
      })
    }
    onClose()
  }

  const pending = createMut.isPending || updateMut.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="surface-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold text-stone-900">
          {product ? 'Editar producto' : 'Nuevo producto'}
        </h2>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">Nombre</label>
            <input
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              {...register('name')}
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Categoría
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              {...register('categoryId')}
            >
              <option value="">Sin categoría</option>
              {categoriesQuery.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700">Costo</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                {...register('cost', { valueAsNumber: true })}
              />
              {errors.cost ? (
                <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Margen %
              </label>
              <input
                type="number"
                step="0.1"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                {...register('marginPct', { valueAsNumber: true })}
              />
              {errors.marginPct ? (
                <p className="mt-1 text-sm text-red-600">{errors.marginPct.message}</p>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700">Unidad</label>
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                {...register('unit')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Código barras
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                {...register('barcode')}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Notas</label>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              {...register('notes')}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-soft px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {pending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
