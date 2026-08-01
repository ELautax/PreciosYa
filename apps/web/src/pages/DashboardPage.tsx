import { useMemo, type ComponentType } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Share2,
  PlusCircle,
  Zap,
  Store,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  DollarSign,
  Receipt,
  Tags,
} from 'lucide-react'

import { LocalSelector } from '@/components/locals/LocalSelector'
import { useLatestExport } from '@/hooks/useExports'
import { useIpcLatest } from '@/hooks/useIpc'
import { useLocals } from '@/hooks/useLocals'
import { useMe } from '@/hooks/useMe'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { useProducts } from '@/hooks/useProducts'
import { EmptyState } from '@/components/feedback/EmptyState'
import { UserTierBadge } from '@/components/ui/UserTierBadge'
import { formatIndexMonth } from '@/lib/categoryIndex'
import { formatArsRate, formatPct } from '@/lib/formatPct'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: profile } = useMe()
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

  const alertCount = alertsQ.data?.total ?? 0
  const hasAlerts = alertCount > 0
  const ipcPeriodLabel = ipcQ.data?.ipc?.period
    ? formatIndexMonth(ipcQ.data.ipc.period)
    : null
  const usdVariation = ipcQ.data?.bcra
    ? `${ipcQ.data.bcra.valuePct >= 0 ? '+' : ''}${formatPct(ipcQ.data.bcra.valuePct)}% vs ayer`
    : null

  if (loadingLocals) {
    return (
      <div className="page-shell">
        <div className="page-wrap space-y-8">
          <div className="flex flex-col gap-4">
            <div className="skeleton h-10 w-48" />
            <div className="skeleton h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (locals && locals.length === 0) {
    return (
      <div className="page-shell">
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
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-wrap space-y-8 sm:space-y-10">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-fade-in space-y-2">
            <h1 className="heading-xl flex flex-wrap items-center gap-3">
              <span>Hola, {profile?.name?.split(' ')[0] || 'Comerciante'}</span>
              {profile ? <UserTierBadge user={profile} size="md" /> : null}
            </h1>
            <p className="text-small flex flex-wrap items-center gap-2">
              <Activity size={14} className="text-primary-600" />
              <span>
                Panel de control
                {selectedLocal ? (
                  <>
                    {' '}
                    · <span className="font-bold text-text-main">{selectedLocal.name}</span>
                  </>
                ) : null}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 animate-slide-up">
            {locals && (
              <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
            )}
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5 animate-fade-in">
          <KPICard
            label="Productos"
            value={productsQ.data?.total}
            loading={productsLoading}
            icon={Package}
            color="text-primary-600"
            bg="bg-primary-50 dark:bg-primary-900/20"
            to="/products"
          />
          <KPICard
            label="Alertas margen"
            value={alertsQ.data?.total}
            loading={alertsLoading}
            icon={AlertTriangle}
            color="text-danger-600"
            bg="bg-danger-50 dark:bg-danger-900/20"
            alert={hasAlerts}
            hint={hasAlerts ? 'Revisar productos' : 'Sin pendientes'}
            to="/products?filter=alert"
          />
          <KPICard
            label="Variación IPC"
            value={ipcQ.data?.ipc ? `${formatPct(ipcQ.data.ipc.valuePct)}%` : '—'}
            loading={ipcQ.isLoading}
            icon={TrendingUp}
            color="text-accent-600"
            bg="bg-accent-50 dark:bg-accent-900/20"
            hint={ipcPeriodLabel ? `Corte ${ipcPeriodLabel}` : undefined}
            to="/products?bulk=ipc"
          />
          <KPICard
            label="USD oficial"
            value={
              ipcQ.data?.bcra?.usdRateArs != null
                ? `$${formatArsRate(ipcQ.data.bcra.usdRateArs)}`
                : ipcQ.isFetching
                  ? '…'
                  : 'Sin datos'
            }
            loading={ipcQ.isLoading && !ipcQ.data}
            icon={DollarSign}
            color="text-primary-700"
            bg="bg-primary-50 dark:bg-primary-900/20"
            hint={usdVariation ?? undefined}
            to="/products?bulk=usd"
          />
          <div className="col-span-2 lg:col-span-1 xl:col-span-1">
            <KPICard
              label="Última lista"
              value={
                latestExportQ.data?.priceList
                  ? new Date(latestExportQ.data.priceList.createdAt).toLocaleDateString('es-AR')
                  : '—'
              }
              loading={latestExportQ.isLoading}
              icon={Share2}
              color="text-primary-700"
              bg="bg-primary-100/50 dark:bg-primary-900/30"
              to="/products?export=1"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          <section className="space-y-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <h2 className="heading-lg">Acciones rápidas</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <QuickActionCard
                title="Registrar venta"
                desc="Carga rápida del día"
                icon={Receipt}
                to="/sales?tab=register"
                color="primary"
              />
              <QuickActionCard
                title="Nuevo producto"
                desc="Carga manual de artículos"
                icon={PlusCircle}
                to="/products?new=1"
                color="primary"
              />
              <QuickActionCard
                title="Aplicar IPC"
                desc="Ajuste por inflación INDEC"
                icon={Zap}
                to="/products?bulk=ipc"
                color="warning"
              />
              <QuickActionCard
                title="Exportar lista"
                desc="Catálogo PNG para WhatsApp"
                icon={Share2}
                to="/products?export=1"
                color="primary"
              />
              <QuickActionCard
                title="Rubros"
                desc="IPC o USD por rubro"
                icon={Tags}
                to="/categories"
                color="secondary"
              />
              <QuickActionCard
                title="Ventas de hoy"
                desc="Resumen del día"
                icon={Receipt}
                to="/sales?tab=summary&period=today"
                color="secondary"
              />
              <QuickActionCard
                title="Mi cuenta"
                desc="Perfil, plan y negocio"
                icon={Store}
                to="/settings?tab=account"
                color="secondary"
              />
            </div>
          </section>

          <aside className="space-y-4 animate-slide-up sm:space-y-5">
            <div className="surface-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-surface-soft/60 px-5 py-4">
                <h3 className="text-xs font-bold text-text-subtle">
                  Estado del local
                </h3>
              </div>
              <div className="space-y-5 p-5">
                {selectedLocal ? (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-end justify-between gap-2">
                        <span className="text-xs font-semibold text-text-subtle">
                          Margen mínimo de alerta
                        </span>
                        <span className="font-mono text-sm font-black text-primary-600">
                          {selectedLocal.minMarginPct}%
                        </span>
                      </div>
                      <p className="text-xs font-medium leading-snug text-text-muted">
                        Si un producto queda por debajo, aparece como alerta en el catálogo.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface-soft/80 p-3">
                      <div className="rounded-lg bg-surface p-2 text-primary-600 shadow-sm">
                        <Store size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-none text-text-muted">
                          Local activo
                        </p>
                        <p className="mt-1 truncate text-sm font-bold text-text-main">
                          {selectedLocal.name}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/locals')}
                      className="btn-secondary h-11 w-full text-xs font-bold"
                    >
                      Editar local
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

            {hasAlerts ? (
              <div className="surface-card border-danger-200 bg-danger-50/50 p-5 shadow-danger-600/5">
                <div className="mb-3 flex items-center gap-3 text-danger-600">
                  <div className="rounded-full bg-surface p-2 shadow-sm dark:bg-danger-900/20">
                    <AlertTriangle size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-black text-danger-700">Alerta de margen</h3>
                </div>
                <p className="mb-5 text-xs font-bold leading-relaxed text-danger-900/80">
                  Tenés{' '}
                  <span className="font-black text-danger-600">{alertCount} productos</span> por
                  debajo del margen mínimo.
                </p>
                <Link
                  to="/products?filter=alert"
                  className="btn-danger h-11 w-full text-xs font-bold"
                >
                  Corregir márgenes
                </Link>
              </div>
            ) : (
              <div className="surface-card border-primary-100 bg-primary-50/30 p-5">
                <div className="mb-2 flex items-center gap-3 text-primary-600">
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                  <h3 className="text-sm font-bold text-primary-700">Todo en orden</h3>
                </div>
                <p className="text-xs font-medium leading-relaxed text-text-subtle">
                  No hay alertas de margen en el local actual.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

type KPICardProps = {
  label: string
  value: string | number | null | undefined
  loading?: boolean
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  color: string
  bg: string
  alert?: boolean
  hint?: string
  to?: string
}

function KPICard({ label, value, loading, icon: Icon, color, bg, alert, hint, to }: KPICardProps) {
  const inner = (
    <>
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl transition-all group-hover:scale-110 group-hover:rotate-3 ${bg} ${color}`}
      >
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <p className="text-xs font-bold leading-none text-text-subtle">
        {label}
      </p>
      {loading ? (
        <div className="skeleton mt-3 h-8 w-24" />
      ) : (
        <>
          <p className={`kpi-value mt-2 break-words ${alert ? '!text-danger-600' : ''}`}>
            {value ?? '—'}
          </p>
          {hint ? (
            <p className="mt-1.5 text-[10px] font-bold leading-snug text-text-subtle">{hint}</p>
          ) : null}
        </>
      )}
    </>
  )

  const className = `surface-card group block p-4 transition-all duration-300 sm:p-5 ${
    alert ? 'border-danger-200 bg-danger-50/20 shadow-danger-600/5' : ''
  } ${to ? 'hover:-translate-y-0.5 hover:border-primary-200/80 hover:shadow-md active:scale-[0.99]' : ''}`

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    )
  }

  return <div className={className}>{inner}</div>
}

type QuickActionCardProps = {
  title: string
  desc: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  to: string
  color: 'primary' | 'warning' | 'secondary'
}

function QuickActionCard({ title, desc, icon: Icon, to, color }: QuickActionCardProps) {
  const colorStyles = {
    primary: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
    warning: 'text-accent-600 bg-accent-50 dark:bg-accent-900/20',
    secondary: 'text-text-muted bg-surface-soft',
  }

  return (
    <Link
      to={to}
      className="surface-card group relative flex items-center gap-4 overflow-hidden p-5 transition-all hover:-translate-y-1 hover:shadow-warm-lg active:scale-[0.98] sm:gap-5 sm:p-6"
    >
      <div
        className={`absolute top-0 right-0 h-24 w-24 -translate-y-12 translate-x-12 rounded-full opacity-5 transition-transform group-hover:scale-150 ${colorStyles[color]}`}
      />

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] transition-all group-hover:scale-110 group-hover:-rotate-6 sm:h-14 sm:w-14 ${colorStyles[color]}`}
      >
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-black leading-tight text-text-main transition-colors group-hover:text-primary-600">
          {title}
        </h3>
        <p className="mt-1.5 text-xs font-medium text-text-subtle">
          {desc}
        </p>
      </div>
      <div className="rounded-full bg-surface-soft p-2 text-text-subtle transition-all group-hover:bg-primary-600 group-hover:text-white">
        <ArrowUpRight size={16} strokeWidth={3} />
      </div>
    </Link>
  )
}
