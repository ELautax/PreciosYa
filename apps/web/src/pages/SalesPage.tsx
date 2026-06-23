import { useEffect, useMemo, useState } from 'react'
import type { SalesPeriod } from 'shared'
import {
  BarChart3,
  ClipboardList,
  History,
  LineChart,
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

const TABS: { id: TabId; label: string; icon: typeof Receipt }[] = [
  { id: 'summary', label: 'Resumen', icon: BarChart3 },
  { id: 'register', label: 'Registrar', icon: Receipt },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'analysis', label: 'Análisis', icon: LineChart },
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
      <div className="page-wrap max-w-5xl space-y-8 animate-fade-in">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-700 dark:bg-primary-900/20">
              <ClipboardList size={12} />
              Gestor de ventas
            </div>
            <h1 className="heading-xl">Ventas</h1>
            <p className="text-small mt-1">
              Registrá ventas rápido y mirá qué productos te dejan más ganancia.
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <LocalSelector locals={locals} value={localId} onChange={setLocalId} />
          </div>
        </header>

        {selectedLocal ? (
          <section className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <div className="relative group lg:block">
                <nav className="flex flex-row gap-1 overflow-x-auto rounded-2xl border border-border bg-surface-soft p-1.5 scrollbar-hide lg:flex-col snap-x snap-mandatory">
                  {TABS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all snap-start lg:w-full min-h-[48px] ${
                        tab === item.id
                          ? 'bg-surface text-primary-600 shadow-sm ring-1 ring-border-strong/10'
                          : 'text-text-subtle hover:text-text-main hover:bg-surface/50'
                      }`}
                    >
                      <item.icon size={16} strokeWidth={tab === item.id ? 2.5 : 2} />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  ))}
                </nav>
                {/* Visual fade for mobile scroll indication */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface-soft to-transparent pointer-events-none lg:hidden rounded-r-2xl" />
              </div>
            </aside>

            <div className="lg:col-span-3">
              <div className="surface-card p-5 sm:p-8">
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
