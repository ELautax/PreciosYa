import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  History, 
  Tags, 
  Store,
  ChevronLeft,
  Package,
  Zap,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'

import { ExportModal } from '@/components/exports/ExportModal'
import { LocalSelector } from '@/components/locals/LocalSelector'
import { BulkUpdateModal } from '@/components/products/BulkUpdateModal'
import { IndexStatusBanner } from '@/components/products/IndexStatusBanner'
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
import { EmptyState } from '@/components/feedback/EmptyState'

function CategoryFilterSelect({
  localId,
  value,
  onChange,
}: {
  localId: string
  value: string
  onChange: (v: string) => void
}) {
  const q = useCategories(localId, true, { refetchOnMount: true })
  return (
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle group-focus-within:text-primary-600 transition-colors">
        <Filter size={16} />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={q.isLoading}
        className="w-full min-w-[160px] pl-10 pr-4"
      >
        <option value="">Todas las categorías</option>
        {q.data?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function ProductsMain({ locals }: { locals: LocalDto[] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localId, setLocalId] = useSelectedLocal(locals)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkInitialTab, setBulkInitialTab] = useState<'percentage' | 'ipc' | 'usd'>('percentage')
  const [importOpen, setImportOpen] = useState(false)
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [editing, setEditing] = useState<ProductDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null)

  const ipcQuery = useIpcLatest()
  const waitingForLocal = locals.length > 0 && !localId
  const filterParam = searchParams.get('filter')
  const productsQuery = useProducts(localId, {
    search: search.trim() || undefined,
    ...(categoryFilter ? { categoryId: categoryFilter } : {}),
    ...(filterParam === 'alert' ? { isAlert: true } : {}),
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
    setDeleteTarget(p)
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return
    try {
      await deleteMut.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // toast handled in useDeleteProduct.onError
    }
  }

  return (
    <main className="page-shell">
      <div className="page-wrap space-y-8 animate-fade-in">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Link to="/dashboard" className="group inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-all">
              <ChevronLeft size={14} strokeWidth={3} className="transition-transform group-hover:-translate-x-0.5" />
              Volver al Panel
            </Link>
            <h1 className="heading-xl">Catálogo de Productos</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
              className="btn-primary"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </header>

        <section className="grid gap-4">
           {/* Contextual Action Bar */}
           <div className="surface-card p-4 flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                 <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
                 
                 <div className="relative flex-1 min-w-[200px] group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle group-focus-within:text-primary-600 transition-colors">
                       <Search size={18} />
                    </div>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por nombre o código..."
                      className="w-full pl-10 pr-4"
                    />
                 </div>

                 <CategoryFilterSelect localId={localId} value={categoryFilter} onChange={setCategoryFilter} />
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4 lg:border-t-0 lg:pt-0 lg:pl-4 lg:border-l">
                 <button
                   type="button"
                   onClick={() => setBulkOpen(true)}
                   className="btn-secondary flex-1 sm:flex-none h-11 px-4"
                   title="Actualización Masiva"
                 >
                    <Zap size={18} className="text-accent-600" />
                    <span className="sm:hidden xl:inline">Actualizar</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setImportOpen(true)}
                   className="btn-secondary flex-1 sm:flex-none h-11 px-4"
                   title="Importar CSV"
                 >
                    <Upload size={18} className="text-primary-600" />
                    <span className="sm:hidden xl:inline">Importar</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setExportOpen(true)}
                   className="btn-secondary flex-1 sm:flex-none h-11 px-4"
                   disabled={!productsQuery.data?.items?.length}
                   title="Exportar PNG"
                 >
                    <Download size={18} className="text-primary-600" />
                    <span className="sm:hidden xl:inline">Exportar</span>
                 </button>
              </div>
           </div>

           {/* Links Bar */}
           <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Link to="/categories" className="btn-ghost h-9 px-3 gap-1.5 whitespace-nowrap">
                <Tags size={16} />
                Categorías
              </Link>
              <Link to="/history" className="btn-ghost h-9 px-3 gap-1.5 whitespace-nowrap">
                <History size={16} />
                Historial
              </Link>
              <Link to="/locals" className="btn-ghost h-9 px-3 gap-1.5 whitespace-nowrap">
                <Store size={16} />
                Gestionar Locales
              </Link>
           </div>
        </section>

        <IndexStatusBanner
          variant="ipc"
          indexPeriod={ipcQuery.data?.ipc?.period ?? null}
          indexValueLabel={
            ipcQuery.data?.ipc != null ? `${ipcQuery.data.ipc.valuePct.toFixed(2)}%` : '—'
          }
          lastAppliedPeriod={selectedLocal?.lastIpcAppliedPeriod ?? null}
          description="Actualizá los costos de rubros con IPC (no incluye rubros marcados como USD en Categorías)."
          onOpenBulk={() => {
            setBulkInitialTab('ipc')
            setBulkOpen(true)
          }}
        />

        <IndexStatusBanner
          variant="usd"
          indexPeriod={ipcQuery.data?.bcra?.period ?? null}
          indexValueLabel={
            ipcQuery.data?.bcra?.usdRateArs != null
              ? `$${ipcQuery.data.bcra.usdRateArs.toLocaleString('es-AR')} (${ipcQuery.data.bcra.valuePct >= 0 ? '+' : ''}${ipcQuery.data.bcra.valuePct.toFixed(2)}%)`
              : ipcQuery.isFetching
                ? 'Sincronizando…'
                : 'Sin cotización — redeploy API o esperá al cron BCRA'
          }
          lastAppliedPeriod={selectedLocal?.lastUsdAppliedPeriod ?? null}
          description="Solo afecta productos en rubros con «Indexar USD» activo. Configuralo en Categorías."
          onOpenBulk={() => {
            setBulkInitialTab('usd')
            setBulkOpen(true)
          }}
        />

        <div className="min-h-[400px]">
          {waitingForLocal || productsQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-48 w-full" />)}
            </div>
          ) : productsQuery.data?.items.length === 0 ? (
             <div className="py-12">
                <EmptyState 
                  icon={Package}
                  title={search || categoryFilter ? "Sin coincidencias" : "No hay productos"}
                  description={search || categoryFilter 
                    ? "Probá con otros términos o limpiá los filtros para ver más resultados." 
                    : "Empezá a cargar tus artículos para automatizar tus precios y márgenes."}
                  action={!(search || categoryFilter) ? (
                    <button onClick={() => setFormOpen(true)} className="btn-primary">
                       Crear mi primer producto
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setSearch(''); setCategoryFilter(''); }}
                      className="btn-secondary"
                    >
                       Limpiar Filtros
                    </button>
                  )}
                />
             </div>
          ) : productsQuery.isError ? (
             <div className="py-12">
                <EmptyState 
                  icon={AlertTriangle}
                  title="Error al cargar productos"
                  description="No pudimos obtener el listado. Revisá tu conexión o probá de nuevo en unos momentos."
                  action={
                    <button
                      type="button"
                      onClick={() => void productsQuery.refetch()}
                      className="btn-secondary"
                    >
                       Reintentar
                    </button>
                  }
                />
             </div>
          ) : productsQuery.data ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-text-subtle">
                    {productsQuery.data.total} {productsQuery.data.total === 1 ? 'PRODUCTO ENCONTRADO' : 'PRODUCTOS ENCONTRADOS'}
                 </p>
              </div>
              <ProductList
                products={productsQuery.data.items}
                onEdit={(p) => {
                  setEditing(p)
                  setFormOpen(true)
                }}
                onDelete={handleDelete}
              />
            </div>
          ) : null}
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
          usdRateArs={ipcQuery.data?.bcra?.usdRateArs ?? null}
          usdVariationPct={ipcQuery.data?.bcra?.valuePct ?? null}
          initialTab={bulkInitialTab}
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
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center animate-fade-in backdrop-blur-sm">
          <div
            className="surface-card w-full max-w-md p-6 shadow-warm-lg animate-slide-up"
            role="dialog"
            aria-labelledby="delete-product-title"
          >
            <h2 id="delete-product-title" className="text-lg font-black text-text-main">
              Dar de baja producto
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              ¿Querés dar de baja <span className="font-bold text-text-main">{deleteTarget.name}</span>?
              Podés volver a cargarlo más tarde como producto nuevo.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary flex-1 sm:flex-none"
                disabled={deleteMut.isPending}
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger flex-1 sm:flex-none"
                disabled={deleteMut.isPending}
                onClick={() => void confirmDelete()}
              >
                {deleteMut.isPending ? 'Dando de baja…' : 'Dar de baja'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default function ProductsPage() {
  const {
    data: locals,
    isLoading: loadingLocals,
    isError: localsError,
    refetch: refetchLocals,
  } = useLocals()
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
        <div className="page-wrap space-y-8">
           <div className="skeleton h-12 w-64" />
           <div className="skeleton h-24 w-full" />
           <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-48 w-full" />)}
           </div>
        </div>
      </div>
    )
  }

  if (localsError && !locals?.length) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-md py-12">
          <EmptyState
            icon={AlertTriangle}
            title="No se pudieron cargar tus locales"
            description="La API no respondió (suele pasar si faltan migraciones en el servidor). Reintentá en unos segundos."
            action={
              <button type="button" className="btn-primary" onClick={() => void refetchLocals()}>
                Reintentar
              </button>
            }
          />
        </div>
      </main>
    )
  }

  if (!locals?.length) {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-md py-12">
           <EmptyState 
              icon={Store}
              title="Creá un local"
              description="Para empezar a cargar productos, primero necesitás registrar tu negocio."
              action={
                <form
                  onSubmit={(e) => void handleCreateLocal(e)}
                  className="mt-2 flex flex-col gap-3 w-full"
                >
                  <input
                    value={newLocalName}
                    onChange={(e) => setNewLocalName(e.target.value)}
                    placeholder="Ej. Kiosco Central"
                    className="w-full text-center"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={createLocal.isPending}
                    className="btn-primary w-full"
                  >
                    {createLocal.isPending ? 'Creando...' : 'Registrar Local'}
                    <ArrowRight size={18} className="ml-2" />
                  </button>
                </form>
              }
           />
        </div>
      </main>
    )
  }

  return <ProductsMain locals={locals} />
}
