import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { ExportModal } from '@/components/exports/ExportModal'
import { LocalSelector } from '@/components/locals/LocalSelector'
import { BulkUpdateModal } from '@/components/products/BulkUpdateModal'
import { IPCBanner } from '@/components/products/IPCBanner'
import { ProductForm } from '@/components/products/ProductForm'
import { ProductImportModal } from '@/components/products/ProductImportModal'
import { ProductList } from '@/components/products/ProductList'
import { useCategories } from '@/hooks/useCategories'
import { useIpcLatest } from '@/hooks/useIpc'
import { useCreateLocal, useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import {
  useDeleteProduct,
  useImportProductsCsv,
  useProducts,
  type CsvImportResult,
} from '@/hooks/useProducts'
import type { LocalDto } from '@/types/local'
import type { ProductDto } from '@/types/product'

function CategoryFilterSelect({
  localId,
  value,
  onChange,
}: {
  localId: string
  value: string
  onChange: (v: string) => void
}) {
  const q = useCategories(localId)
  return (
    <label className="flex items-center gap-2 text-sm text-stone-700">
      Categoría
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={q.isLoading}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">Todas</option>
        {q.isLoading ? (
          <option value="" disabled>
            Cargando categorías…
          </option>
        ) : null}
        {q.data?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function ProductsMain({ locals }: { locals: LocalDto[] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localId, setLocalId] = useSelectedLocal(locals)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [editing, setEditing] = useState<ProductDto | null>(null)

  const ipcQuery = useIpcLatest()
  const productsQuery = useProducts(localId, {
    search: search.trim() || undefined,
    ...(categoryFilter ? { categoryId: categoryFilter } : {}),
  })
  const deleteMut = useDeleteProduct(localId)
  const importMut = useImportProductsCsv(localId)
  const selectedLocal = locals.find((l) => l.id === localId) ?? locals[0]

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(null)
      setFormOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const canUseKeyboardShortcuts =
      window.matchMedia('(pointer: fine) and (hover: hover)').matches &&
      navigator.maxTouchPoints === 0
    if (!canUseKeyboardShortcuts) return

    const onKeyDown = (event: KeyboardEvent) => {
      const wantsNew = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n'
      if (!wantsNew) return
      event.preventDefault()
      setEditing(null)
      setFormOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleDelete(p: ProductDto): void {
    if (
      typeof window !== 'undefined' &&
      window.confirm(`¿Dar de baja "${p.name}"?`)
    ) {
      void deleteMut.mutateAsync(p.id)
    }
  }

  return (
    <main className="page-shell">
      <div className="page-wrap max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
              ← Panel
            </Link>
            <h1 className="mt-2 page-heading">Productos</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/locals"
              className="btn-soft"
            >
              Locales
            </Link>
            <Link
              to="/history"
              className="btn-soft"
            >
              Historial
            </Link>
            <Link
              to="/categories"
              className="btn-soft"
            >
              Categorías
            </Link>
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
            >
              Actualización masiva
            </button>
            <button
              type="button"
              onClick={() => {
                setImportResult(null)
                setImportOpen(true)
              }}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
            >
              Importar CSV
            </button>
            <button
              type="button"
              onClick={() => setExportOpen(true)}
              className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100"
            >
              Exportar lista
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Nuevo producto
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
          <label className="flex flex-1 items-center gap-2 text-sm text-stone-700 sm:min-w-[200px]">
            Buscar
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre…"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </label>
          <CategoryFilterSelect localId={localId} value={categoryFilter} onChange={setCategoryFilter} />
        </div>
        <IPCBanner
          ipcPct={ipcQuery.data?.ipc?.valuePct ?? null}
          onOpenBulk={() => setBulkOpen(true)}
        />

        <div className="mt-8">
          {productsQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-44 animate-pulse rounded-xl bg-stone-200" />
              <div className="h-44 animate-pulse rounded-xl bg-stone-200" />
            </div>
          ) : productsQuery.data ? (
            <>
              <p className="mono mb-4 text-sm text-stone-500">
                {productsQuery.data.total} producto
                {productsQuery.data.total !== 1 ? 's' : ''}
              </p>
              <ProductList
                products={productsQuery.data.items}
                onEdit={(p) => {
                  setEditing(p)
                  setFormOpen(true)
                }}
                onDelete={handleDelete}
              />
            </>
          ) : (
            <p className="text-sm text-red-700">No se pudieron cargar los productos.</p>
          )}
        </div>
      </div>

      {formOpen ? (
        <ProductForm
          localId={localId}
          product={editing}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      ) : null}
      {bulkOpen ? (
        <BulkUpdateModal
          localId={localId}
          ipcPct={ipcQuery.data?.ipc?.valuePct ?? null}
          onClose={() => setBulkOpen(false)}
        />
      ) : null}
      {importOpen ? (
        <ProductImportModal
          isImporting={importMut.isPending}
          lastResult={importResult}
          onDismissResult={() => setImportResult(null)}
          onImport={(csv) => {
            importMut.mutate(csv, {
              onSuccess: (data) => setImportResult(data),
            })
          }}
          onClose={() => {
            setImportOpen(false)
            setImportResult(null)
          }}
        />
      ) : null}
      {exportOpen && selectedLocal && productsQuery.data ? (
        <ExportModal
          local={selectedLocal}
          products={productsQuery.data.items}
          onClose={() => setExportOpen(false)}
        />
      ) : null}
    </main>
  )
}

export default function ProductsPage() {
  const { data: locals, isLoading: loadingLocals } = useLocals()
  const createLocal = useCreateLocal()
  const [newLocalName, setNewLocalName] = useState('')

  async function handleCreateLocal(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!newLocalName.trim()) return
    await createLocal.mutateAsync({ name: newLocalName.trim() })
    setNewLocalName('')
  }

  if (loadingLocals) {
    return (
      <div className="page-shell">
        <div className="page-wrap max-w-4xl space-y-4">
          <div className="h-10 w-44 animate-pulse rounded bg-stone-200" />
          <div className="h-24 animate-pulse rounded-xl bg-stone-200" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-40 animate-pulse rounded-xl bg-stone-200" />
            <div className="h-40 animate-pulse rounded-xl bg-stone-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!locals?.length) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-md">
          <Link to="/dashboard" className="text-sm text-green-700 hover:underline">
            ← Volver al panel
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-stone-900">Productos</h1>
          <p className="mt-2 text-sm text-stone-600">
            Creá un local para empezar a cargar productos.
          </p>
          <form
            onSubmit={(e) => void handleCreateLocal(e)}
            className="mt-6 space-y-3 rounded-xl border border-stone-200 bg-white p-5"
          >
            <label className="block text-sm font-medium text-stone-700">
              Nombre del negocio
              <input
                value={newLocalName}
                onChange={(e) => setNewLocalName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                placeholder="Ej. Kiosco Central"
              />
            </label>
            <button
              type="submit"
              disabled={createLocal.isPending}
              className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {createLocal.isPending ? 'Creando…' : 'Crear local'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return <ProductsMain locals={locals} />
}
