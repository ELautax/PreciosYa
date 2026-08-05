import { useEffect, useMemo, useRef, useState } from 'react'
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
  ArrowRight,
  MoreHorizontal
} from 'lucide-react'

import { ExportModal } from '@/components/exports/ExportModal'
import { LocalSelector } from '@/components/locals/LocalSelector'
import { BulkUpdateModal } from '@/components/products/BulkUpdateModal'
import { BarcodeScanner } from '@/components/products/BarcodeScanner'
import { IndexStatusBanner } from '@/components/products/IndexStatusBanner'
import { ProductForm } from '@/components/products/ProductForm'
import { ProductImportModal } from '@/components/products/ProductImportModal'
import { ProductList } from '@/components/products/ProductList'
import { useCategories } from '@/hooks/useCategories'
import { useIpcLatest } from '@/hooks/useIpc'
import { useCreateLocal, useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { useApiClient } from '@/hooks/useApiClient'
import {
  fetchAllLocalProducts,
  useDeleteProduct,
  useImportProductsCsv,
  useInfiniteProducts,
  type CsvImportResult,
} from '@/hooks/useProducts'
import { appToast } from '@/lib/toast'
import type { LocalDto } from '@/types/local'
import type { CategoryDto } from '@/types/category'
import type { ProductDto } from '@/types/product'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatArsRate, formatPct } from '@/lib/formatPct'

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
        className="w-full min-w-0 truncate pl-10 pr-8"
      >
        <option value="">Todos los rubros</option>
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
  const [exportLoading, setExportLoading] = useState(false)
  const [exportProducts, setExportProducts] = useState<ProductDto[]>([])
  const [exportMatchedTotal, setExportMatchedTotal] = useState(0)
  const [editing, setEditing] = useState<ProductDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null)
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false)
  const barcodeHandlerRef = useRef<((code: string) => void) | null>(null)
  const api = useApiClient()

  const ipcQuery = useIpcLatest()
  const waitingForLocal = locals.length > 0 && !localId
  const filterParam = searchParams.get('filter')
  const listFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      ...(categoryFilter ? { categoryId: categoryFilter } : {}),
      ...(filterParam === 'alert' ? { isAlert: true as const } : {}),
    }),
    [search, categoryFilter, filterParam],
  )
  const productsQuery = useInfiniteProducts(localId, listFilters)
  const products = useMemo(
    () => productsQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [productsQuery.data],
  )
  const productsTotal = productsQuery.data?.pages[0]?.total ?? 0
  const withoutCategoryCount = useMemo(
    () => products.filter((p) => !p.categoryId).length,
    [products],
  )
  const deleteMut = useDeleteProduct(localId)
  const importMut = useImportProductsCsv(localId)
  const selectedLocal = locals.find((l) => l.id === localId) ?? locals[0]
  const categoriesQuery = useCategories(localId)
  const activeRubrosQuery = useCategories(localId, true)
  const activeRubros = activeRubrosQuery.data?.length ?? 0
  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoryDto>()
    categoriesQuery.data?.forEach((c) => map.set(c.id, c))
    return map
  }, [categoriesQuery.data])
  const filterActive = Boolean(
    search.trim() || categoryFilter || filterParam === 'alert',
  )

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
    const bulk = searchParams.get('bulk')
    if (bulk === 'ipc' || bulk === 'usd' || bulk === 'percentage') {
      setBulkInitialTab(bulk)
      setBulkOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('bulk')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  async function openExport(): Promise<void> {
    if (!localId) return
    setExportOpen(true)
    setExportLoading(true)
    setExportProducts([])
    try {
      const data = await fetchAllLocalProducts(api, localId, listFilters)
      setExportProducts(data.items)
      setExportMatchedTotal(data.total)
    } catch {
      appToast.error('No se pudo cargar el catálogo para exportar')
      setExportOpen(false)
    } finally {
      setExportLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('export') !== '1' || !localId) return
    const next = new URLSearchParams(searchParams)
    next.delete('export')
    setSearchParams(next, { replace: true })
    void openExport()
    // Abrir export solo cuando llega ?export=1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localId, searchParams.get('export')])

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
    <div className="page-shell">
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
              className="btn-primary flex-1 sm:flex-none shadow-primary-600/30"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </header>

        <section className="grid gap-4">
           {/* Contextual Action Bar */}
           <div className="surface-card p-3 sm:p-4 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
                 <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
                 
                 <div className="relative flex-1 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle group-focus-within:text-primary-600 transition-colors">
                       <Search size={18} />
                    </div>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar productos..."
                      className="w-full pl-10 pr-4"
                    />
                 </div>

                 <div className="hidden sm:block">
                   <CategoryFilterSelect localId={localId} value={categoryFilter} onChange={setCategoryFilter} />
                 </div>
              </div>

              <div className="flex flex-col gap-2 sm:hidden">
                <CategoryFilterSelect localId={localId} value={categoryFilter} onChange={setCategoryFilter} />
                <button
                  type="button"
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className={`btn-secondary min-h-[48px] w-full px-4 ${isActionsOpen ? 'bg-surface-soft border-border-strong' : ''}`}
                >
                  <MoreHorizontal size={18} className="text-primary-600" />
                  <span className="text-[10px] font-black uppercase tracking-wide">Acciones</span>
                </button>
              </div>

              <div className={`${isActionsOpen ? 'flex' : 'hidden lg:flex'} flex-wrap items-center gap-2 border-t border-border pt-4 lg:border-t-0 lg:pt-0 lg:pl-4 lg:border-l`}>
                 <button
                   type="button"
                   onClick={() => { setBulkInitialTab('percentage'); setBulkOpen(true); }}
                   className="btn-secondary min-h-[48px] flex-1 px-4 sm:flex-none"
                   title="Actualización Masiva"
                 >
                    <Zap size={18} className="text-accent-600" />
                    <span className="text-xs font-bold">Actualizar</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setImportOpen(true)}
                   className="btn-secondary min-h-[48px] flex-1 px-4 sm:flex-none"
                   title="Importar CSV"
                 >
                    <Upload size={18} className="text-primary-600" />
                    <span className="text-xs font-bold">Importar</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => void openExport()}
                   className="btn-secondary min-h-[48px] flex-1 px-4 sm:flex-none"
                   disabled={productsTotal === 0 && !productsQuery.isLoading}
                   title="Exportar PNG"
                 >
                    <Download size={18} className="text-primary-600" />
                    <span className="text-xs font-bold">Exportar</span>
                 </button>
              </div>
           </div>

           {/* Links Bar - Scrollable Chips */}
           <div className="relative group">
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                <Link to="/categories" className="btn-secondary h-11 px-4 gap-2 whitespace-nowrap rounded-xl snap-start text-xs font-bold shadow-sm border-border-strong/20 bg-surface">
                  <Tags size={16} className="text-primary-600" />
                  Rubros
                </Link>
                <Link to="/history" className="btn-secondary h-11 px-4 gap-2 whitespace-nowrap rounded-xl snap-start text-xs font-bold shadow-sm border-border-strong/20 bg-surface">
                  <History size={16} className="text-primary-600" />
                  Historial
                </Link>
                <Link to="/locals" className="btn-secondary h-11 px-4 gap-2 whitespace-nowrap rounded-xl snap-start text-xs font-bold shadow-sm border-border-strong/20 bg-surface">
                  <Store size={16} className="text-primary-600" />
                  Locales
                </Link>
             </div>
             <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-canvas to-transparent pointer-events-none sm:hidden" />
           </div>
        </section>

        <IndexStatusBanner
          variant="ipc"
          indexPeriod={ipcQuery.data?.ipc?.period ?? null}
          indexValueLabel={
            ipcQuery.data?.ipc != null ? `${ipcQuery.data.ipc.valuePct.toFixed(2)}%` : '—'
          }
          lastAppliedPeriod={selectedLocal?.lastIpcAppliedPeriod ?? null}
          description="Actualizá los costos de rubros con IPC (no incluye rubros marcados como USD en Rubros)."
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
              ? `$${formatArsRate(ipcQuery.data.bcra.usdRateArs)} (${ipcQuery.data.bcra.valuePct >= 0 ? '+' : ''}${formatPct(ipcQuery.data.bcra.valuePct)}%)`
              : ipcQuery.isFetching
                ? 'Sincronizando…'
                : 'Cotización no disponible — se actualiza automáticamente cada día'
          }
          lastAppliedPeriod={selectedLocal?.lastUsdAppliedPeriod ?? null}
          description="Solo afecta productos en rubros con «Indexar USD» activo. Configuralo en Rubros."
          onOpenBulk={() => {
            setBulkInitialTab('usd')
            setBulkOpen(true)
          }}
        />

        {!activeRubrosQuery.isLoading && activeRubros === 0 ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-accent-200/80 bg-accent-50/40 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-accent-900/10">
            <div>
              <p className="text-sm font-black text-text-main">Activá tus rubros</p>
              <p className="mt-1 text-xs font-medium text-text-muted">
                Sin rubros activos, el IPC se aplica solo como índice general. En Rubros elegí los
                que vendés (y «Indexar USD» si aplica).
              </p>
            </div>
            <Link to="/categories" className="btn-secondary h-11 shrink-0 px-4 text-xs font-bold">
              <Tags size={16} />
              Ir a Rubros
            </Link>
          </div>
        ) : null}

        {filterParam === 'alert' ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-danger-200 bg-danger-50 px-3 py-1.5 text-xs font-bold text-danger-800">
              Solo alertas de margen
              <button
                type="button"
                className="rounded-full px-1.5 hover:bg-danger-100"
                aria-label="Quitar filtro de alertas"
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.delete('filter')
                  setSearchParams(next, { replace: true })
                }}
              >
                ×
              </button>
            </span>
          </div>
        ) : null}

        {withoutCategoryCount > 0 ? (
          <p className="text-xs font-semibold text-text-muted">
            {withoutCategoryCount} producto{withoutCategoryCount === 1 ? '' : 's'} sin rubro en esta
            vista — al aplicar IPC usan el nivel general.
          </p>
        ) : null}

        <div className="min-h-[400px]">
          {waitingForLocal || productsQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton h-48 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
             <div className="py-12">
                <EmptyState 
                  icon={Package}
                  title={search || categoryFilter || filterParam === 'alert' ? "Sin coincidencias" : "No hay productos"}
                  description={search || categoryFilter || filterParam === 'alert'
                    ? "Probá con otros términos o limpiá los filtros para ver más resultados." 
                    : activeRubros === 0
                      ? "Primero activá rubros en Rubros y después cargá tu primer producto."
                      : "Empezá a cargar tus artículos para automatizar precios y márgenes."}
                  action={!(search || categoryFilter || filterParam === 'alert') ? (
                    activeRubros === 0 ? (
                      <Link to="/categories" className="btn-primary">
                        Activar rubros
                      </Link>
                    ) : (
                    <button onClick={() => setFormOpen(true)} className="btn-primary">
                       Crear mi primer producto
                    </button>
                    )
                  ) : (
                    <button 
                      onClick={() => {
                        setSearch('')
                        setCategoryFilter('')
                        const next = new URLSearchParams(searchParams)
                        next.delete('filter')
                        setSearchParams(next, { replace: true })
                      }}
                      className="btn-secondary"
                    >
                       Limpiar filtros
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
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-4">
                 <p className="text-xs font-bold text-text-subtle">
                    Mostrando {products.length} de {productsTotal}{' '}
                    {productsTotal === 1 ? 'producto' : 'productos'}
                 </p>
              </div>
               <ProductList
                products={products}
                categoryMap={categoryMap}
                onEdit={(p) => {
                  setEditing(p)
                  setFormOpen(true)
                }}
                onDelete={handleDelete}
              />
              {productsQuery.hasNextPage ? (
                <div className="flex justify-center pb-4">
                  <button
                    type="button"
                    className="btn-secondary h-11 px-6 text-xs font-bold"
                    disabled={productsQuery.isFetchingNextPage}
                    onClick={() => void productsQuery.fetchNextPage()}
                  >
                    {productsQuery.isFetchingNextPage ? 'Cargando…' : 'Cargar más productos'}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Mantener el formulario montado al escanear: si se desmonta, se pierde el código aplicado */}
      {formOpen ? (
        <ProductForm
          localId={localId}
          product={editing}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onOpenBarcodeScanner={(onDetected) => {
            barcodeHandlerRef.current = onDetected
            setBarcodeScannerOpen(true)
          }}
        />
      ) : null}
      <BarcodeScanner
        open={barcodeScannerOpen}
        onClose={() => {
          setBarcodeScannerOpen(false)
          barcodeHandlerRef.current = null
        }}
        onDetected={(code) => {
          barcodeHandlerRef.current?.(code)
          setBarcodeScannerOpen(false)
          barcodeHandlerRef.current = null
        }}
      />
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
      {exportOpen && selectedLocal ? (
        <ExportModal
          local={selectedLocal}
          products={exportProducts}
          matchedTotal={exportMatchedTotal}
          loading={exportLoading}
          filterActive={filterActive}
          onClose={() => {
            setExportOpen(false)
            setExportProducts([])
          }}
        />
      ) : null}
      {deleteTarget ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4 animate-fade-in backdrop-blur-sm">
          <div
            className="surface-card w-full max-w-md rounded-t-[2rem] p-6 pb-safe shadow-warm-lg animate-slide-up sm:rounded-2xl sm:pb-6"
            role="dialog"
            aria-labelledby="delete-product-title"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border-strong/40 sm:hidden" />
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
                className="btn-secondary h-12 min-h-[48px] flex-1 sm:flex-none"
                disabled={deleteMut.isPending}
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger h-12 min-h-[48px] flex-1 sm:flex-none"
                disabled={deleteMut.isPending}
                onClick={() => void confirmDelete()}
              >
                {deleteMut.isPending ? 'Dando de baja…' : 'Dar de baja'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
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
      <div className="page-shell">
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
      </div>
    )
  }

  if (!locals?.length) {
    return (
      <div className="page-shell">
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
                    className="btn-primary w-full h-12"
                  >
                    {createLocal.isPending ? 'Creando...' : 'Registrar Local'}
                    <ArrowRight size={18} className="ml-2" />
                  </button>
                </form>
              }
           />
        </div>
      </div>
    )
  }

  return <ProductsMain locals={locals} />
}
