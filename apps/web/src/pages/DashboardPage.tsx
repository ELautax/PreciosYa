import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Share2, 
  PlusCircle, 
  Zap, 
  History,
  Store,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  DollarSign,
} from 'lucide-react'

import type { ApiSuccess } from 'shared'
import { LocalSelector } from '@/components/locals/LocalSelector'
import { useLatestExport } from '@/hooks/useExports'
import { useApiClient } from '@/hooks/useApiClient'
import { useIpcLatest } from '@/hooks/useIpc'
import { useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { useProducts } from '@/hooks/useProducts'
import type { AppUser } from '@/types/appUser'
import { EmptyState } from '@/components/feedback/EmptyState'

export default function DashboardPage() {
  const api = useApiClient()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AppUser | null>(null)
  const { data: locals, isLoading: loadingLocals } = useLocals()
  const [localId, setLocalId] = useSelectedLocal(locals)
  
  const selectedLocal = useMemo(
    () => locals?.find((l) => l.id === localId) ?? null,
    [locals, localId],
  )

  const waitingForLocal = Boolean(locals?.length && !localId)
  const productsQ = useProducts(localId || undefined, { page: 1, limit: 1 })
  const alertsQ = useProducts(localId || undefined, { page: 1, limit: 1, isAlert: true })
  const productsLoading = waitingForLocal || productsQ.isLoading
  const alertsLoading = waitingForLocal || alertsQ.isLoading
  const ipcQ = useIpcLatest()
  const latestExportQ = useLatestExport()

  useEffect(() => {
    let cancelled = false
    void api
      .get<ApiSuccess<{ user: AppUser }>>('/api/auth/me')
      .then((res) => {
        if (!cancelled) setProfile(res.data.data.user)
      })
      .catch(() => {
        if (!cancelled) setProfile(null)
      })
    return () => {
      cancelled = true
    }
  }, [api])

  if (loadingLocals) {
    return (
      <main className="page-shell">
        <div className="page-wrap space-y-8">
           <div className="flex flex-col gap-4">
              <div className="skeleton h-10 w-48" />
              <div className="skeleton h-4 w-64" />
           </div>
           <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 w-full" />)}
           </div>
        </div>
      </main>
    )
  }

  if (locals && locals.length === 0) {
    return (
      <main className="page-shell">
        <div className="page-wrap max-w-2xl py-12">
           <EmptyState 
              icon={Store}
              title="Bienvenido a PreciosYa"
              description="Para empezar a gestionar tus productos y aplicar los índices de inflación, primero necesitás crear un local."
              action={
                <Link to="/locals" className="btn-primary">
                   Crear mi primer local
                </Link>
              }
           />
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <div className="page-wrap space-y-10">
        {/* Header Section */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-fade-in">
            <h1 className="heading-xl">
              Hola, {profile?.name?.split(' ')[0] || 'Comerciante'} <span className="animate-bounce inline-block">👋</span>
            </h1>
            <p className="text-small mt-2 flex items-center gap-2">
              <Activity size={14} className="text-primary-600" />
              Resumen de actividad · {selectedLocal?.name || 'Cargando...'}
            </p>
          </div>
          <div className="flex items-center gap-3 animate-slide-up">
            {locals && (
               <LocalSelector
                locals={locals}
                value={localId}
                onChange={setLocalId}
              />
            )}
          </div>
        </header>

        {/* KPI Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-fade-in">
          <KPICard 
            label="Productos" 
            value={productsQ.data?.total} 
            loading={productsLoading}
            icon={Package}
            color="text-primary-600"
            bg="bg-primary-50 dark:bg-primary-900/20"
          />
          <KPICard 
            label="Alertas Margen" 
            value={alertsQ.data?.total} 
            loading={alertsLoading}
            icon={AlertTriangle}
            color="text-danger-600"
            bg="bg-danger-50 dark:bg-danger-900/20"
            alert={Boolean(alertsQ.data?.total && alertsQ.data.total > 0)}
          />
          <KPICard 
            label="Variación IPC" 
            value={ipcQ.data?.ipc ? `${ipcQ.data.ipc.valuePct.toFixed(2)}%` : '—'} 
            loading={ipcQ.isLoading}
            icon={TrendingUp}
            color="text-accent-600"
            bg="bg-accent-50 dark:bg-accent-900/20"
          />
          <KPICard 
            label="USD oficial" 
            value={
              ipcQ.data?.bcra?.usdRateArs != null
                ? `$${ipcQ.data.bcra.usdRateArs.toLocaleString('es-AR')}${
                    ipcQ.data.bcra ? ` (${ipcQ.data.bcra.valuePct >= 0 ? '+' : ''}${ipcQ.data.bcra.valuePct.toFixed(2)}%)` : ''
                  }`
                : ipcQ.isFetching
                  ? '…'
                  : 'Sin datos'
            } 
            loading={ipcQ.isLoading && !ipcQ.data}
            icon={DollarSign}
            color="text-primary-700"
            bg="bg-primary-50 dark:bg-primary-900/20"
          />
          <div className="col-span-2 lg:col-span-1">
            <KPICard 
              label="Último PNG" 
              value={latestExportQ.data?.priceList ? new Date(latestExportQ.data.priceList.createdAt).toLocaleDateString('es-AR') : '—'} 
              loading={latestExportQ.isLoading}
              icon={Share2}
              color="text-primary-700"
              bg="bg-primary-100/50 dark:bg-primary-900/30"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Quick Actions */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
               <h2 className="heading-lg">Acciones Rápidas</h2>
               <div className="h-[1px] flex-1 bg-border" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <QuickActionCard 
                title="Nuevo Producto"
                desc="Carga manual de artículos"
                icon={PlusCircle}
                to="/products?new=1"
                color="primary"
              />
              <QuickActionCard 
                title="Actualización IPC"
                desc="Ajuste masivo por inflación"
                icon={Zap}
                to="/products"
                color="warning"
              />
              <QuickActionCard 
                title="Exportar Lista"
                desc="Generar catálogo para clientes"
                icon={Share2}
                to="/products"
                color="primary"
              />
              <QuickActionCard 
                title="Historial"
                desc="Rastreo de cambios de costos"
                icon={History}
                to="/history"
                color="secondary"
              />
            </div>
          </section>

          {/* Contextual Sidebar */}
          <aside className="space-y-6 animate-slide-up">
             <div className="surface-card overflow-hidden">
                <div className="bg-primary-600 p-4">
                   <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Estado Operativo</h3>
                </div>
                <div className="p-6 space-y-5">
                   {selectedLocal ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-text-subtle uppercase">Margen Mínimo</span>
                          <span className="text-sm font-black text-primary-600">{selectedLocal.minMarginPct}%</span>
                        </div>
                        <div className="h-2 w-full bg-surface-soft rounded-full overflow-hidden border border-border">
                           <div 
                             className="h-full bg-primary-600 transition-all duration-1000" 
                             style={{ width: `${Math.min(100, selectedLocal.minMarginPct * 2)}%` }} 
                           />
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 rounded-xl bg-surface-soft p-3">
                         <div className="rounded-lg bg-white p-2 shadow-sm text-primary-600 dark:bg-canvas">
                            <Store size={16} />
                         </div>
                         <div className="min-w-0">
                            <p className="text-[10px] font-black text-text-muted uppercase leading-none">Local Activo</p>
                            <p className="mt-1 text-xs font-bold text-text-main truncate">{selectedLocal.name}</p>
                         </div>
                      </div>

                      <button 
                        onClick={() => navigate('/locals')} 
                        className="btn-secondary w-full h-11 text-xs font-black uppercase tracking-widest"
                      >
                         Ajustes del local
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="skeleton h-12 w-full" />
                      <div className="skeleton h-10 w-full" />
                      <div className="skeleton h-10 w-full" />
                    </div>
                  )}
                </div>
             </div>

             {alertsQ.data?.total && alertsQ.data.total > 0 ? (
               <div className="surface-card border-danger-200 bg-danger-50/50 p-6 shadow-danger-600/5">
                  <div className="flex items-center gap-3 text-danger-600 mb-3">
                     <div className="rounded-full bg-white p-2 shadow-sm dark:bg-danger-900/20">
                        <AlertTriangle size={20} strokeWidth={2.5} />
                     </div>
                     <h3 className="text-sm font-black uppercase tracking-widest">Alerta Crítica</h3>
                  </div>
                  <p className="text-xs font-bold text-danger-900/80 mb-5 leading-relaxed">
                     Tenés <span className="text-danger-600 font-black">{alertsQ.data.total} productos</span> con margen negativo o por debajo del mínimo.
                  </p>
                  <Link to="/products?filter=alert" className="btn-danger w-full h-11 text-[10px] font-black uppercase tracking-widest">
                     Corregir márgenes
                  </Link>
               </div>
             ) : (
                <div className="surface-card p-6 border-primary-100 bg-primary-50/20">
                   <div className="flex items-center gap-3 text-primary-600 mb-2">
                      <CheckCircle2 size={18} strokeWidth={2.5} />
                      <h3 className="text-xs font-black uppercase tracking-widest">Todo en orden</h3>
                   </div>
                   <p className="text-[10px] font-bold text-text-subtle leading-relaxed">
                      No hay alertas de margen detectadas en el local actual.
                   </p>
                </div>
             )}
          </aside>
        </div>
      </div>
    </main>
  )
}

function KPICard({ label, value, loading, icon: Icon, color, bg, alert }: any) {
  return (
    <div className={`surface-card p-5 group transition-all duration-500 ${alert ? 'border-danger-200 bg-danger-50/20 shadow-danger-600/5' : ''}`}>
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl transition-all group-hover:scale-110 group-hover:rotate-3 ${bg} ${color}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-text-subtle leading-none">{label}</p>
      {loading ? (
        <div className="skeleton mt-3 h-8 w-20" />
      ) : (
        <p className={`kpi-value mt-2 ${alert ? '!text-danger-600' : ''}`}>
          {value}
        </p>
      )}
    </div>
  )
}

function QuickActionCard({ title, desc, icon: Icon, to, color }: any) {
  const colorStyles = {
    primary: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
    warning: 'text-accent-600 bg-accent-50 dark:bg-accent-900/20',
    secondary: 'text-text-muted bg-surface-soft',
  }
  
  return (
    <Link 
      to={to} 
      className="surface-card p-6 flex items-center gap-5 hover:-translate-y-1.5 hover:shadow-warm-lg transition-all active:scale-[0.98] group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 h-24 w-24 -translate-y-12 translate-x-12 rounded-full opacity-5 transition-transform group-hover:scale-150 ${colorStyles[color as keyof typeof colorStyles]}`} />
      
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] transition-all group-hover:scale-110 group-hover:-rotate-6 ${colorStyles[color as keyof typeof colorStyles]}`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-text-main leading-tight group-hover:text-primary-600 transition-colors">{title}</h3>
        <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest mt-1.5">{desc}</p>
      </div>
      <div className="rounded-full bg-surface-soft p-2 text-text-subtle transition-all group-hover:bg-primary-600 group-hover:text-white">
        <ArrowUpRight size={16} strokeWidth={3} />
      </div>
    </Link>
  )
}
