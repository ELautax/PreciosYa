import { useEffect, useMemo, useState } from 'react'
import type { SalesPeriod } from 'shared'
import {
  BarChart3,
  ClipboardList,
  History,
  LineChart,
  Lock,
  Receipt,
  Store,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { LocalSelector } from '@/components/locals/LocalSelector'
import { SaleRegisterTab } from '@/components/sales/SaleRegisterTab'
import { SalesAnalysisTab } from '@/components/sales/SalesAnalysisTab'
import { SalesHistoryTab } from '@/components/sales/SalesHistoryTab'
import { SalesSummaryTab } from '@/components/sales/SalesSummaryTab'
import { defaultCustomRange } from '@/components/sales/format'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useLocals } from '@/hooks/useLocals'
import { useSelectedLocal } from '@/hooks/useSelectedLocal'
import { useMe } from '@/hooks/useMe'

type TabId = 'summary' | 'register' | 'history' | 'analysis'

const TABS: { id: TabId; label: string; icon: typeof Receipt; proOnly?: boolean }[] = [
  { id: 'summary', label: 'Resumen', icon: BarChart3 },
  { id: 'register', label: 'Registrar', icon: Receipt },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'analysis', label: 'Análisis', icon: LineChart, proOnly: true },
]

export default function SalesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<TabId>('summary')
  const [period, setPeriod] = useState<SalesPeriod>('7d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const { data: me } = useMe()
  const { data: locals, isLoading: loadingLocals } = useLocals()
  const [localId, setLocalId] = useSelectedLocal(locals)
  const selectedLocal = useMemo(
    () => locals?.find((l) => l.id === localId) ?? null,
    [locals, localId],
  )

  const isPro = me?.plan === 'PRO' || me?.plan === 'AGENCY'

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'register' || t === 'summary' || t === 'history' || t === 'analysis') {
      setTab(t)
    }
  }, [searchParams])

  function selectTab(next: TabId) {
    setTab(next)
    setSearchParams({ tab: next }, { replace: true })
  }

  function handlePeriodChange(next: SalesPeriod) {
    if (next === 'custom' && (!customFrom || !customTo)) {
      const defaults = defaultCustomRange()
      setCustomFrom(defaults.from)
      setCustomTo(defaults.to)
    }
    setPeriod(next)
  }

  if (loadingLocals) {
    return (
      <div className="page-shell">
        <div className="page-wrap space-y-4">
          <div className="skeleton h-10 w-48" />
          <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!locals?.length) {
    return (
      <div className="page-shell">
        <div className="page-wrap">
          <EmptyState
            icon={Store}
            title="Sin locales"
            description="Creá un local antes de registrar ventas."
            action={
              <Link to="/locals" className="btn-primary">
                Ir a Locales
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-wrap max-w-5xl min-w-0 space-y-4 sm:space-y-8 animate-fade-in">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-700 dark:bg-primary-900/20">
              <ClipboardList size={12} />
              Gestor de ventas
            </div>
            <h1 className="text-3xl font-black tracking-tight text-text-main sm:text-4xl">Ventas</h1>
            <p className="text-small mt-1">
              Registrá ventas rápido y mirá qué productos te dejan más ganancia.
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
          </div>
        </header>

        {selectedLocal ? (
          <section className="grid min-w-0 gap-3 lg:grid-cols-4 lg:gap-6">
            <aside className="min-w-0 lg:col-span-1">
              <nav
                className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-surface-soft p-1.5 lg:flex lg:flex-col"
                aria-label="Secciones de ventas"
              >
                {TABS.map((item) => {
                  const locked = item.proOnly && !isPro
                  const active = tab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      aria-label={locked ? `${item.label} (requiere Pro)` : item.label}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all sm:gap-2 sm:px-3 sm:py-3 lg:w-full lg:justify-start ${
                        active
                          ? 'bg-surface text-primary-600 shadow-sm ring-1 ring-border-strong/10'
                          : 'text-text-subtle hover:bg-surface/50 hover:text-text-main'
                      }`}
                    >
                      <item.icon size={16} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {locked ? (
                        <Lock size={10} strokeWidth={2.5} className="shrink-0 opacity-50 lg:ml-auto" />
                      ) : null}
                    </button>
                  )
                })}
              </nav>
            </aside>

            <div className="min-w-0 lg:col-span-3">
              <div className="surface-card min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
                {tab === 'summary' && localId ? (
                  <SalesSummaryTab
                    localId={localId}
                    period={period}
                    onPeriodChange={handlePeriodChange}
                    customFrom={customFrom}
                    customTo={customTo}
                    onCustomFromChange={setCustomFrom}
                    onCustomToChange={setCustomTo}
                    isPro={isPro}
                  />
                ) : null}
                {tab === 'register' && localId ? <SaleRegisterTab localId={localId} /> : null}
                {tab === 'history' && localId ? (
                  <SalesHistoryTab localId={localId} isPro={isPro} />
                ) : null}
                {tab === 'analysis' && localId ? (
                  <SalesAnalysisTab
                    localId={localId}
                    period={period}
                    customFrom={customFrom}
                    customTo={customTo}
                    isPro={isPro}
                  />
                ) : null}
              </div>
            </div>
          </section>
        ) : (
          <div className="skeleton h-40 w-full rounded-2xl" />
        )}
      </div>
    </div>
  )
}
