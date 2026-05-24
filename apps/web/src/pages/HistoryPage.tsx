import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Package, Store, ChevronLeft, TrendingUp, Calendar, Info, LineChart } from 'lucide-react'

import { LocalSelector } from '@/components/locals/LocalSelector'
import { PriceHistoryChart } from '@/components/history/PriceHistoryChart'
import { PriceHistoryTable } from '@/components/history/PriceHistoryTable'
import { useIpcHistory } from '@/hooks/useIpc'
import { useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { useProductHistory, useProducts } from '@/hooks/useProducts'
import { EmptyState } from '@/components/feedback/EmptyState'

export default function HistoryPage() {
  const { data: locals, isLoading: loadingLocals } = useLocals()
  const [localId, setLocalId] = useSelectedLocal(locals)
  const [productId, setProductId] = useState('')

  const productsQ = useProducts(localId, { limit: 100 })
  const historyQ = useProductHistory(productId || undefined)
  const ipcHistoryQ = useIpcHistory()

  const products = productsQ.data?.items ?? []
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId],
  )
  const historyRows = historyQ.data ?? []
  const marginTrendMonths = useMemo(() => {
    const months = new Set<string>()
    historyRows.forEach((row) => {
      const d = new Date(row.recordedAt)
      if (!Number.isNaN(d.getTime())) {
        months.add(`${d.getFullYear()}-${d.getMonth() + 1}`)
      }
    })
    return months.size
  }, [historyRows])

  useEffect(() => {
    if (!products.length) {
      setProductId('')
      return
    }
    if (!products.some((p) => p.id === productId)) {
      setProductId(products[0].id)
    }
  }, [products, productId])

  if (loadingLocals) {
    return (
      <div className="page-shell">
        <div className="page-wrap space-y-10 animate-fade-in">
           <div className="flex flex-col gap-4">
              <div className="skeleton h-10 w-48" />
              <div className="skeleton h-4 w-64" />
           </div>
           <div className="skeleton h-24 w-full" />
           <div className="skeleton h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (!locals?.length) {
    return (
      <main className="page-shell">
        <div className="page-wrap max-w-2xl py-12 animate-fade-in">
           <EmptyState 
              icon={Store}
              title="No hay locales registrados"
              description="Para ver el historial de precios, primero debés registrar un local y cargar productos."
              action={
                <Link to="/locals" className="btn-primary">
                   Registrar mi primer local
                </Link>
              }
           />
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <div className="page-wrap space-y-10 animate-fade-in">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Link to="/dashboard" className="group inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-all leading-none mb-1">
              <ChevronLeft size={14} strokeWidth={3} className="transition-transform group-hover:-translate-x-0.5" />
              Volver al Panel
            </Link>
            <h1 className="heading-xl">Historial de Precios</h1>
          </div>
          <div className="flex items-center gap-2">
             <Link to="/products" className="btn-secondary h-11 px-4 gap-2">
                <Package size={18} strokeWidth={2.5} />
                <span className="text-xs font-black uppercase tracking-widest">Catálogo</span>
             </Link>
          </div>
        </header>

        <section className="grid gap-6">
           <div className="surface-card p-6 flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex-1 flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">Local Activo</label>
                 <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
              </div>
              
              <div className="h-px w-full bg-border lg:h-12 lg:w-px" />

              <div className="flex-[2] flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">Producto a analizar</label>
                 <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle group-focus-within:text-primary-600 transition-colors">
                       <Package size={18} />
                    </div>
                    <select
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="w-full pl-11 pr-4 h-12"
                      disabled={products.length === 0}
                    >
                      {products.length === 0 ? (
                        <option>Sin productos registrados</option>
                      ) : (
                        products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))
                      )}
                    </select>
                 </div>
              </div>
           </div>
        </section>

        <div className="space-y-12">
           {productsQ.isLoading ? (
             <div className="space-y-6">
                <div className="skeleton h-[300px] w-full" />
                <div className="skeleton h-[200px] w-full" />
             </div>
           ) : products.length === 0 ? (
             <div className="py-12">
                <EmptyState 
                   icon={Package}
                   title="Local sin productos"
                   description="Este negocio no tiene artículos cargados para generar un historial."
                   action={
                     <Link to="/products?new=1" className="btn-primary">
                        Empezar carga de stock
                     </Link>
                   }
                />
             </div>
           ) : historyQ.isLoading ? (
             <div className="space-y-6 pt-4">
                <div className="skeleton h-[400px] w-full rounded-[2rem]" />
             </div>
           ) : historyRows.length > 0 ? (
             <>
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary-600 text-white shadow-md">
                        <LineChart size={18} strokeWidth={2.5} />
                     </div>
                     <h2 className="heading-lg">Gráfico de Evolución</h2>
                     <div className="h-px flex-1 bg-border" />
                  </div>
                  {marginTrendMonths < 2 ? (
                    <div className="surface-card p-12 flex flex-col items-center justify-center text-center animate-fade-in border-dashed">
                       <div className="rounded-3xl bg-surface-soft p-6 text-text-subtle mb-6">
                          <TrendingUp size={40} strokeWidth={1.5} />
                       </div>
                       <p className="text-base font-black text-text-main leading-none">Historial insuficiente</p>
                       <p className="mt-3 text-sm font-medium text-text-subtle max-w-xs leading-relaxed">
                          La visualización aparecerá cuando realices cambios en los costos o márgenes a lo largo del tiempo.
                       </p>
                    </div>
                  ) : (
                    <div className="animate-scale-in">
                       <PriceHistoryChart rows={historyRows} />
                    </div>
                  )}
               </div>

               <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-accent-600 text-white shadow-md">
                        <History size={18} strokeWidth={2.5} />
                     </div>
                     <h2 className="heading-lg">Bitácora de Cambios</h2>
                     <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="animate-fade-in">
                     <PriceHistoryTable rows={historyRows} />
                  </div>
               </div>
             </>
           ) : (
             <div className="py-12">
                <EmptyState 
                   icon={History}
                   title="Sin registros previos"
                   description={`El producto "${selectedProduct?.name}" mantiene sus valores originales desde la creación.`}
                   compact
                />
             </div>
           )}

           <section className="space-y-6 pt-4">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-accent-600 text-white shadow-md">
                   <TrendingUp size={18} strokeWidth={2.5} />
                </div>
                <h2 className="heading-lg">Referencia IPC INDEC</h2>
                <div className="h-px flex-1 bg-border" />
             </div>
             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
               {ipcHistoryQ.data?.map((row) => (
                 <div key={row.id} className="surface-card p-6 group hover:border-accent-600/30 transition-all duration-300">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                         <div className="rounded-xl bg-surface-soft p-2.5 text-primary-600">
                            <Calendar size={16} strokeWidth={2.5} />
                         </div>
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">
                            {new Date(row.period).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                         </span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-accent-700 dark:bg-accent-900/20 shadow-xs border border-accent-100/50">
                         <TrendingUp size={12} strokeWidth={3} />
                         <span className="font-mono text-xs font-black">+{row.valuePct.toFixed(2)}%</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-600" />
                      <p className="text-[10px] font-extrabold text-text-main uppercase tracking-tight leading-none">Índice Mensual Oficial</p>
                   </div>
                 </div>
               ))}
               {!ipcHistoryQ.isLoading && ipcHistoryQ.data?.length === 0 && (
                  <div className="col-span-full rounded-[2rem] border border-dashed border-border p-12 text-center bg-surface-soft/30">
                     <Info size={32} className="mx-auto text-text-subtle/50 mb-4" />
                     <p className="text-sm font-bold text-text-subtle">No hay datos históricos del INDEC registrados.</p>
                  </div>
               )}
             </div>
           </section>
        </div>
      </div>
    </main>
  )
}
