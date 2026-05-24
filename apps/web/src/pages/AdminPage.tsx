import { useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck,
  Users,
  Store,
  Package,
  AlertTriangle,
  Search,
  TrendingUp,
  Zap,
  Mail,
  ArrowUpRight,
  RefreshCw,
  ChevronDown,
  Save,
} from 'lucide-react'

import {
  useAdminForceFetchIpc,
  useAdminIndices,
  useAdminManualIpc,
  useAdminStats,
  useAdminUpdatePlan,
  useAdminUsers,
} from '@/hooks/useAdmin'
import { useMe } from '@/hooks/useMe'
import { EmptyState } from '@/components/feedback/EmptyState'
import { IPC_INDEX_LABELS, IPC_INDEX_TYPES } from '@/lib/ipcLabels'

export default function AdminPage() {
  const { data: me, isLoading: loadingMe } = useMe()
  const [search, setSearch] = useState('')
  const usersQ = useAdminUsers(1, search)
  const statsQ = useAdminStats()
  const indicesQ = useAdminIndices()
  const updatePlanMut = useAdminUpdatePlan()
  const forceIpcMut = useAdminForceFetchIpc()
  const manualIpcMut = useAdminManualIpc()
  const [manualOpen, setManualOpen] = useState(false)
  const [manualPeriod, setManualPeriod] = useState(() => {
    const d = new Date()
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  })
  const [manualValues, setManualValues] = useState<Record<string, string>>({})

  const indicesByType = useMemo(() => {
    const map: Record<string, number> = {}
    for (const idx of indicesQ.data ?? []) {
      map[idx.type] = idx.valuePct
    }
    return map
  }, [indicesQ.data])

  useEffect(() => {
    if (!manualOpen || indicesQ.isLoading) return
    setManualValues((prev) => {
      const next = { ...prev }
      for (const type of IPC_INDEX_TYPES) {
        if (next[type] === undefined && indicesByType[type] !== undefined) {
          next[type] = String(indicesByType[type])
        }
      }
      return next
    })
  }, [manualOpen, indicesQ.isLoading, indicesByType])

  const latestPeriodLabel = indicesQ.data?.[0]?.period
    ? new Date(indicesQ.data[0].period).toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      })
    : null

  if (loadingMe) {
    return (
      <div className="page-shell">
        <div className="page-wrap space-y-10 animate-fade-in">
           <div className="skeleton h-12 w-64" />
           <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 w-full" />)}
           </div>
           <div className="skeleton h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!me?.isAdmin) {
    return (
      <main className="page-shell">
        <div className="page-wrap max-w-2xl py-20 animate-fade-in">
           <EmptyState 
              icon={ShieldCheck}
              title="Acceso Restringido"
              description="Esta sección está reservada exclusivamente para administradores del sistema."
              action={
                <button onClick={() => window.history.back()} className="btn-secondary">
                   Volver atrás
                </button>
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
          <div className="flex items-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-600 text-white shadow-lg shadow-danger-600/20 animate-pulse">
                <ShieldCheck size={24} strokeWidth={2.5} />
             </div>
             <div>
                <h1 className="heading-xl">Panel de Administración</h1>
                <p className="text-[10px] font-black text-text-subtle uppercase tracking-widest leading-none mt-1">Control Central del Sistema</p>
             </div>
          </div>
          
          <button
            type="button"
            onClick={() => void forceIpcMut.mutateAsync()}
            disabled={forceIpcMut.isPending}
            className="btn-warning h-12 px-6 shadow-xl shadow-accent-600/20 group"
          >
            {forceIpcMut.isPending ? (
               <RefreshCw size={18} className="animate-spin mr-2" />
            ) : (
               <Zap size={18} className="mr-2 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-black uppercase tracking-widest">Sincronizar IPC Manual</span>
          </button>
        </header>

        {/* Global Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <AdminStatCard 
            label="Usuarios" 
            value={statsQ.data?.users ?? 0} 
            icon={Users} 
            color="text-primary-600" 
            bg="bg-primary-50 dark:bg-primary-900/20" 
          />
          <AdminStatCard 
            label="Locales" 
            value={statsQ.data?.locals ?? 0} 
            icon={Store} 
            color="text-accent-600" 
            bg="bg-accent-50 dark:bg-accent-900/20" 
          />
          <AdminStatCard 
            label="Productos" 
            value={statsQ.data?.products ?? 0} 
            icon={Package} 
            color="text-primary-700" 
            bg="bg-primary-100/50 dark:bg-primary-900/30" 
          />
          <AdminStatCard 
            label="Alertas" 
            value={statsQ.data?.alerts ?? 0} 
            icon={AlertTriangle} 
            color="text-danger-600" 
            bg="bg-danger-50 dark:bg-danger-900/20" 
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
           {/* User Management Section */}
           <section className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                 <h2 className="heading-lg">Gestión de Usuarios</h2>
                 <div className="h-px flex-1 bg-border" />
              </div>

              <div className="surface-card overflow-hidden shadow-xl shadow-primary-600/5">
                 <div className="p-5 border-b border-border bg-surface-soft/30">
                    <div className="relative group">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle group-focus-within:text-primary-600 transition-colors">
                          <Search size={18} />
                       </div>
                       <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Buscar por nombre o email..."
                          className="w-full pl-10 pr-4 h-11"
                       />
                    </div>
                 </div>

                 <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left text-sm border-collapse">
                       <thead>
                          <tr className="border-b border-border bg-surface-soft/50">
                             <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">Identidad</th>
                             <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-subtle">Suscripción</th>
                             <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-text-subtle">Acción</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-border/50">
                          {usersQ.data?.items.map((u) => (
                             <tr key={u.id} className="hover:bg-primary-50/5 transition-colors group">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-full bg-surface-soft border border-border flex items-center justify-center font-bold text-text-muted">
                                         {u.name?.charAt(0)}
                                      </div>
                                      <div className="min-w-0">
                                         <p className="font-extrabold text-text-main leading-tight truncate">{u.name}</p>
                                         <p className="text-[10px] font-bold text-text-subtle truncate flex items-center gap-1 uppercase tracking-tighter">
                                            <Mail size={10} /> {u.email}
                                         </p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${
                                      u.plan === 'AGENCY' ? 'border-accent-200 bg-accent-50 text-accent-700' : 
                                      u.plan === 'PRO' ? 'border-primary-100 bg-primary-50 text-primary-700' : 
                                      'border-border bg-surface-soft text-text-subtle'
                                   }`}>
                                      {u.plan}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <select
                                      defaultValue={u.plan}
                                      onChange={(e) =>
                                        void updatePlanMut.mutateAsync({
                                          userId: u.id,
                                          plan: e.target.value as 'FREE' | 'PRO' | 'AGENCY',
                                        })
                                      }
                                      className="h-9 text-[10px] font-black uppercase tracking-widest px-2 pr-8 rounded-lg bg-surface-soft border-none focus:ring-2 ring-primary-600/20"
                                   >
                                      <option value="FREE">LIBRE</option>
                                      <option value="PRO">PRO</option>
                                      <option value="AGENCY">AGENCY</option>
                                   </select>
                                </td>
                             </tr>
                          ))}
                          {!usersQ.isLoading && usersQ.data?.items.length === 0 && (
                             <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-text-subtle font-bold italic">No se encontraron usuarios coincidentes.</td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </section>

           {/* Economic Indices Section */}
           <aside className="space-y-6">
              <div className="flex items-center gap-3">
                 <h2 className="heading-lg">Índices IPC</h2>
                 <div className="h-px flex-1 bg-border" />
              </div>

              {latestPeriodLabel && (
                <p className="text-[10px] font-black uppercase tracking-widest text-text-subtle">
                  Último mes cargado: {latestPeriodLabel}
                </p>
              )}

              <div className="surface-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setManualOpen((o) => !o)}
                  className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left hover:bg-surface-soft/50 transition-colors"
                >
                  <span className="text-xs font-black uppercase tracking-widest text-text-main">
                    Carga manual IPC
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-text-subtle transition-transform ${manualOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {manualOpen && (
                  <form
                    className="space-y-4 border-t border-border px-5 pb-5 pt-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const indices = IPC_INDEX_TYPES.map((type) => ({
                        type,
                        valuePct: Number.parseFloat(manualValues[type] ?? ''),
                      })).filter((row) => Number.isFinite(row.valuePct))
                      if (indices.length === 0) return
                      void manualIpcMut.mutateAsync({ period: manualPeriod, indices })
                    }}
                  >
                    <label className="block space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-subtle">
                        Período (YYYY-MM)
                      </span>
                      <input
                        type="month"
                        value={manualPeriod}
                        onChange={(e) => setManualPeriod(e.target.value)}
                        className="w-full h-10"
                      />
                    </label>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                      {IPC_INDEX_TYPES.map((type) => (
                        <label key={type} className="flex items-center gap-2 text-xs">
                          <span className="flex-1 font-bold text-text-muted truncate">
                            {IPC_INDEX_LABELS[type] ?? type}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={manualValues[type] ?? ''}
                            onChange={(ev) =>
                              setManualValues((prev) => ({
                                ...prev,
                                [type]: ev.target.value,
                              }))
                            }
                            className="w-20 h-9 text-right font-mono text-sm"
                          />
                          <span className="text-[10px] font-black text-text-subtle">%</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={manualIpcMut.isPending}
                      className="btn-primary w-full h-11"
                    >
                      {manualIpcMut.isPending ? (
                        <RefreshCw size={16} className="animate-spin mr-2" />
                      ) : (
                        <Save size={16} className="mr-2" />
                      )}
                      Guardar IPC manual
                    </button>
                  </form>
                )}
              </div>

              <div className="grid gap-3 max-h-[32rem] overflow-y-auto pr-1 scrollbar-hide">
                 {indicesQ.data?.map((idx) => (
                    <div key={idx.id} className="surface-card p-4 group hover:border-primary-600/30 transition-all relative overflow-hidden">
                       <div className="flex items-center justify-between gap-2 relative">
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-subtle leading-tight">
                             {IPC_INDEX_LABELS[idx.type] ?? idx.type}
                          </span>
                          <span className="font-mono text-sm font-black text-text-main tracking-tighter shrink-0">
                            +{idx.valuePct.toFixed(2)}%
                          </span>
                       </div>
                       {idx.sourceUrl?.startsWith('manual:') && (
                         <p className="text-[9px] font-bold text-accent-600 uppercase mt-1">Manual</p>
                       )}
                    </div>
                 ))}
                 {!indicesQ.isLoading && indicesQ.data?.length === 0 && (
                   <div className="surface-card p-8 text-center border-dashed border-border opacity-50">
                      <TrendingUp size={32} className="mx-auto mb-2 text-text-subtle opacity-40" />
                      <p className="text-xs font-bold text-text-subtle uppercase">Sin datos IPC</p>
                      <p className="text-[10px] text-text-subtle mt-2">Sincronizá desde Alphacast o cargá manualmente.</p>
                   </div>
                 )}
              </div>
           </aside>
        </div>
      </div>
    </main>
  )
}

function AdminStatCard({ label, value, icon: Icon, color, bg }: { label: string; value: number; icon: any; color: string; bg: string }) {
  return (
    <div className="surface-card p-6 group hover:-translate-y-1.5 transition-all duration-500 shadow-xl shadow-primary-600/5">
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-all group-hover:scale-110 group-hover:rotate-3 ${bg} ${color}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-text-subtle leading-none">{label}</p>
      <div className="mt-2.5 flex items-baseline gap-2">
         <p className="text-3xl font-black text-text-main tracking-tighter font-mono">{value}</p>
         <ArrowUpRight size={14} className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}
