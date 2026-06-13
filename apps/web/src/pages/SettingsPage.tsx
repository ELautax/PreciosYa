import { useEffect, useMemo, useState } from 'react'
import type { ApiSuccess } from 'shared'
import { User, CreditCard, Store, Info, ShieldCheck, Clock, Activity } from 'lucide-react'

import { LocalSelector } from '@/components/locals/LocalSelector'
import {
  PlanPricingCards,
  planLocalLimit,
  planProductLimit,
} from '@/components/settings/PlanPricingCards'
import { useApiClient } from '@/hooks/useApiClient'
import { useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { useProducts } from '@/hooks/useProducts'
import type { AppUser } from '@/types/appUser'

type TabId = 'business' | 'account' | 'plan'

function normalizePlan(plan: string | undefined): 'FREE' | 'PRO' | 'AGENCY' {
  if (plan === 'PRO' || plan === 'AGENCY') return plan
  return 'FREE'
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('business')
  const api = useApiClient()
  const [user, setUser] = useState<AppUser | null>(null)
  const [meError, setMeError] = useState(false)
  const { data: locals } = useLocals()
  const [localId, setLocalId] = useSelectedLocal(locals)
  const selectedLocal = useMemo(
    () => locals?.find((l) => l.id === localId) ?? null,
    [locals, localId],
  )
  const productsQ = useProducts(localId || undefined, { page: 1, limit: 1 })

  useEffect(() => {
    let cancelled = false
    setMeError(false)
    void api
      .get<ApiSuccess<{ user: AppUser }>>('/api/auth/me')
      .then((res) => {
        if (!cancelled) {
          setUser(res.data.data.user)
          setMeError(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setMeError(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [api])

  const usedProducts = productsQ.data?.total ?? 0
  const currentPlan = normalizePlan(user?.plan)
  const productLimit = planProductLimit(currentPlan)
  const localLimit = planLocalLimit(currentPlan)
  const usedLocals = locals?.length ?? 0
  const usagePct = productLimit ? Math.min(100, (usedProducts / productLimit) * 100) : 0

  return (
    <main className="page-shell">
      <div className="page-wrap max-w-5xl space-y-10 animate-fade-in">
        <header className="flex flex-col gap-2">
          <h1 className="heading-xl">Configuración General</h1>
          <p className="text-small">
             Gestioná tu perfil y parámetros de negocio.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-4">
            {/* Tab Navigation */}
            <aside className="lg:col-span-1">
               <nav className="flex flex-row md:flex-col gap-1 p-1 rounded-2xl bg-surface-soft border border-border overflow-x-auto scrollbar-hide snap-x">
                  <TabButton 
                     active={tab === 'business'} 
                     onClick={() => setTab('business')} 
                     icon={Store} 
                     label="Negocio" 
                  />
                  <TabButton 
                     active={tab === 'account'} 
                     onClick={() => setTab('account')} 
                     icon={User} 
                     label="Cuenta" 
                  />
                  <TabButton 
                     active={tab === 'plan'} 
                     onClick={() => setTab('plan')} 
                     icon={CreditCard} 
                     label="Plan" 
                  />
               </nav>
            </aside>

            <div className="lg:col-span-3 space-y-6">
               {tab === 'business' && (
                 <section className="surface-card p-5 sm:p-8 space-y-8 animate-fade-in shadow-xl shadow-primary-600/5">
                    <div className="flex items-center gap-4">
                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
                          <Store size={24} strokeWidth={2.5} />
                       </div>
                       <div>
                          <h2 className="text-xl font-black tracking-tight text-text-main">Datos Operativos</h2>
                          <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest leading-none mt-1">Configuración por Local</p>
                       </div>
                    </div>

                    {locals && locals.length > 0 ? (
                      <div className="space-y-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">Seleccionar Local</label>
                            <LocalSelector
                               locals={locals}
                               value={localId}
                               onChange={setLocalId}
                            />
                         </div>

                         {selectedLocal ? (
                           <div className="grid gap-6 sm:grid-cols-2 p-6 rounded-[2rem] bg-surface-soft border border-border/50">
                              <DetailItem label="Nombre Fiscal" value={selectedLocal.name} />
                              <DetailItem label="Dirección" value={selectedLocal.address || 'Sin especificar'} />
                              <DetailItem label="Moneda Base" value={selectedLocal.currency} />
                              <DetailItem label="Margen Alerta" value={`${selectedLocal.minMarginPct.toFixed(2)}%`} />
                           </div>
                         ) : (
                           <div className="skeleton h-40 w-full rounded-[2rem]" />
                         )}
                         
                         <div className="bg-primary-50/20 border border-primary-100 p-5 rounded-2xl flex items-start gap-4">
                            <Info size={20} className="text-primary-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase tracking-tight">
                               Los cambios en los parámetros del local afectan el cálculo automático de márgenes.
                            </p>
                         </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center border-2 border-dashed border-border rounded-3xl">
                         <p className="text-sm font-bold text-text-subtle">No hay locales registrados.</p>
                      </div>
                    )}
                 </section>
               )}

               {tab === 'account' && (
                 <section className="surface-card p-5 sm:p-8 space-y-8 animate-fade-in shadow-xl shadow-primary-600/5">
                    <div className="flex items-center gap-4">
                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-600 text-white shadow-lg">
                          <User size={24} strokeWidth={2.5} />
                       </div>
                       <div>
                          <h2 className="text-xl font-black tracking-tight text-text-main">Perfil de Usuario</h2>
                          <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest leading-none mt-1">Identidad</p>
                       </div>
                    </div>

                    {meError ? (
                      <div className="rounded-2xl border border-danger-200 bg-danger-50/30 p-6 space-y-4">
                         <div className="flex items-center gap-3 text-danger-600">
                            <ShieldCheck size={20} strokeWidth={2.5} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Error</h3>
                         </div>
                         <p className="text-xs font-bold text-danger-950/70 leading-relaxed uppercase tracking-tight">
                            No pudimos recuperar los datos de tu cuenta.
                         </p>
                      </div>
                    ) : user ? (
                      <div className="grid gap-6 sm:grid-cols-2 p-6 rounded-[2rem] bg-surface-soft border border-border/50">
                         <DetailItem label="Nombre Completo" value={user.name} />
                         <DetailItem label="Correo Electrónico" value={user.email} />
                         <DetailItem label="Nivel de Acceso" value={user.isAdmin ? 'ADMINISTRADOR' : 'COMERCIANTE'} />
                         <DetailItem label="Ingreso" value={user.planExpiresAt ? new Date().toLocaleDateString('es-AR') : 'Reciente'} />
                      </div>
                    ) : (
                      <div className="space-y-6">
                         <div className="skeleton h-32 w-full rounded-[2rem]" />
                      </div>
                    )}
                 </section>
               )}

               {tab === 'plan' && (
                 <section className="surface-card p-5 sm:p-8 space-y-8 animate-fade-in shadow-xl shadow-primary-600/5">
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
                             <CreditCard size={24} strokeWidth={2.5} />
                          </div>
                          <div>
                             <h2 className="text-xl font-black tracking-tight text-text-main">Plan y Suscripción</h2>
                             <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest leading-none mt-1">Capacidad y planes</p>
                          </div>
                       </div>
                       <span className="inline-flex shrink-0 rounded-full bg-accent-500 px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                          {user?.plan ?? '…'}
                       </span>
                    </div>

                    <div className="p-6 sm:p-8 rounded-[2.5rem] bg-surface-soft border border-border/50 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-5 text-primary-600 group-hover:scale-110 transition-transform duration-500">
                          <Activity size={120} />
                       </div>
                       
                       <div className="relative space-y-6">
                          <div className="grid gap-6 sm:grid-cols-2">
                             <div>
                                <div className="flex items-end justify-between px-1">
                                   <div>
                                      <h3 className="text-base font-black text-text-main leading-none">Productos</h3>
                                      <p className="mt-2 text-[10px] font-black text-text-subtle uppercase tracking-widest">Activos</p>
                                   </div>
                                   <p className="text-2xl font-black text-primary-600 font-mono tracking-tighter">
                                      {usedProducts}<span className="text-text-subtle/50 text-sm mx-1">/</span>{productLimit ?? '∞'}
                                   </p>
                                </div>
                                <div className="mt-3 h-4 w-full bg-border/50 rounded-full overflow-hidden p-1 shadow-inner">
                                   <div 
                                      className="h-full rounded-full bg-primary-600 transition-all duration-1000 shadow-sm"
                                      style={{ width: `${productLimit ? usagePct : 100}%` }}
                                   />
                                </div>
                             </div>
                             <div>
                                <div className="flex items-end justify-between px-1">
                                   <div>
                                      <h3 className="text-base font-black text-text-main leading-none">Locales</h3>
                                      <p className="mt-2 text-[10px] font-black text-text-subtle uppercase tracking-widest">Registrados</p>
                                   </div>
                                   <p className="text-2xl font-black text-primary-600 font-mono tracking-tighter">
                                      {usedLocals}<span className="text-text-subtle/50 text-sm mx-1">/</span>{localLimit ?? '∞'}
                                   </p>
                                </div>
                                <div className="mt-3 h-4 w-full bg-border/50 rounded-full overflow-hidden p-1 shadow-inner">
                                   <div 
                                      className="h-full rounded-full bg-accent-500 transition-all duration-1000 shadow-sm"
                                      style={{ width: `${localLimit ? Math.min(100, (usedLocals / localLimit) * 100) : 100}%` }}
                                   />
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest pt-1">
                             <Clock size={12} className="text-primary-600" />
                             Vencimiento: {user?.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('es-AR') : 'Sin límite'}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="px-1">
                          <h3 className="text-base font-black text-text-main">Compará planes</h3>
                          <p className="mt-1 text-xs font-medium text-text-subtle">
                             Misma oferta que en la web. Pro incluye IPC y dólar BCRA; Agency se cotiza a medida.
                          </p>
                       </div>
                       <PlanPricingCards currentPlan={currentPlan} />
                    </div>
                 </section>
               )}
            </div>
        </section>
      </div>
    </main>
  )
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all snap-start whitespace-nowrap min-w-max md:min-w-0 md:w-full ${
        active 
          ? 'bg-surface text-primary-600 shadow-md shadow-primary-600/5 ring-1 ring-border-strong/10' 
          : 'text-text-subtle hover:bg-surface hover:text-text-main'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? 'text-primary-600' : ''} />
      <span>{label}</span>
    </button>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
       <dt className="text-[9px] font-black text-text-subtle uppercase tracking-widest leading-none px-1">{label}</dt>
       <dd className="text-sm font-bold text-text-main bg-white/50 px-3 py-2.5 rounded-xl border border-border/50 truncate dark:bg-black/10">
          {value}
       </dd>
    </div>
  )
}
