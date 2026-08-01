import { useState, useRef, useEffect, type ComponentType } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  BellOff,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
  Lock,
  Sparkles,
  ChevronRight,
  DollarSign,
} from 'lucide-react'

import { IpcBreakdownModal, type IpcSeriesItem } from '@/components/notifications/IpcBreakdownModal'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationsRealtimeSync,
  useUnreadNotificationsCount,
} from '@/hooks/useNotifications'
import { formatIndexMonth } from '@/lib/categoryIndex'
import { formatArsRate, formatPct, toPctNumber } from '@/lib/formatPct'
import type { NotificationDto } from '@/types/notification'

const NOTIF_ICONS: Record<string, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  NEW_IPC: TrendingUp,
  BCRA_USD_ALERT: DollarSign,
  MARGIN_ALERT: AlertTriangle,
  PLAN_EXPIRING: CalendarClock,
  PLAN_EXPIRED: Lock,
  WELCOME: Sparkles,
}

/** En dark, *-50/*-100 son fondos oscuros: el texto debe usar *-500/*-600 claros. */
const NOTIF_COLORS: Record<string, string> = {
  NEW_IPC: 'bg-accent-50 text-accent-700 dark:text-accent-500',
  BCRA_USD_ALERT: 'bg-primary-50 text-primary-700 dark:text-primary-600',
  MARGIN_ALERT: 'bg-danger-50 text-danger-700 dark:text-danger-600',
  PLAN_EXPIRING: 'bg-accent-50 text-accent-700 dark:text-accent-500',
  PLAN_EXPIRED: 'bg-danger-100 text-danger-700 dark:bg-danger-50 dark:text-danger-600',
  WELCOME: 'bg-primary-50 text-primary-700 dark:text-primary-600',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function asMetaRecord(metadata: unknown): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  return metadata as Record<string, unknown>
}

function parseIpcSeriesFromMeta(meta: Record<string, unknown> | null): IpcSeriesItem[] {
  if (!meta || !Array.isArray(meta.series)) return []
  const out: IpcSeriesItem[] = []
  for (const row of meta.series) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    const item = row as Record<string, unknown>
    const type = typeof item.type === 'string' ? item.type : null
    const valuePct = toPctNumber(item.valuePct)
    if (!type || valuePct === null) continue
    out.push({ type, valuePct })
  }
  return out
}

function notificationHref(type: string): string | null {
  if (type === 'BCRA_USD_ALERT') return '/products'
  if (type === 'MARGIN_ALERT') return '/products?filter=alert'
  if (type === 'PLAN_EXPIRING' || type === 'PLAN_EXPIRED') return '/settings?tab=plan'
  return null
}

function NotificationMetaChips({ n }: { n: NotificationDto }) {
  const meta = asMetaRecord(n.metadata)
  if (!meta) return null

  if (n.type === 'NEW_IPC') {
    const pct = toPctNumber(meta.valuePct)
    const period = typeof meta.period === 'string' ? meta.period : null
    const seriesCount = parseIpcSeriesFromMeta(meta).length
    if (pct === null && !period) return null
    return (
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {pct !== null ? (
          <span className="inline-flex items-center rounded-lg border border-accent-200 bg-accent-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-accent-700 dark:border-accent-200 dark:text-accent-500">
            IPC general +{formatPct(pct)}%
          </span>
        ) : null}
        {period ? (
          <span className="inline-flex items-center rounded-lg border border-border-strong/40 bg-surface-soft px-2 py-1 text-[10px] font-black uppercase tracking-wide text-text-main">
            {formatIndexMonth(period)}
          </span>
        ) : null}
        {seriesCount > 0 ? (
          <span className="inline-flex items-center rounded-lg border border-border-strong/40 bg-surface-soft px-2 py-1 text-[10px] font-black uppercase tracking-wide text-text-muted">
            {seriesCount} rubros
          </span>
        ) : null}
      </div>
    )
  }

  if (n.type === 'BCRA_USD_ALERT') {
    const pct = toPctNumber(meta.valuePct)
    const rate = toPctNumber(meta.usdRate)
    return (
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {rate !== null ? (
          <span className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-primary-800 dark:border-primary-200 dark:text-primary-600">
            USD ${formatArsRate(rate)}
          </span>
        ) : null}
        {pct !== null ? (
          <span className="inline-flex items-center rounded-lg border border-border-strong/40 bg-surface-soft px-2 py-1 text-[10px] font-black uppercase tracking-wide text-text-main">
            {pct >= 0 ? '+' : ''}
            {formatPct(pct)}% vs ayer
          </span>
        ) : null}
      </div>
    )
  }

  return null
}

type IpcModalState = {
  periodIso: string
  series: IpcSeriesItem[]
  generalPct: number | null
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [ipcModal, setIpcModal] = useState<IpcModalState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useNotificationsRealtimeSync()
  const listQ = useNotifications(1)
  const unreadQ = useUnreadNotificationsCount()
  const markOne = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const unread = unreadQ.data ?? 0
  const items = listQ.data?.items ?? []

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ipcModal) return
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [ipcModal])

  function openIpcBreakdown(n: NotificationDto) {
    const meta = asMetaRecord(n.metadata)
    const period = typeof meta?.period === 'string' ? meta.period : n.createdAt
    const series = parseIpcSeriesFromMeta(meta)
    const generalPct = toPctNumber(meta?.valuePct)
    if (!n.isRead) void markOne.mutateAsync(n.id)
    setOpen(false)
    setIpcModal({
      periodIso: period,
      series,
      generalPct,
    })
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-90 ${
          open
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
            : 'bg-surface-soft/80 text-text-muted hover:bg-border/50'
        }`}
        aria-label="Notificaciones"
      >
        <Bell size={22} strokeWidth={open ? 2.5 : 2} />
        {unread > 0 ? (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-scale-in items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-black text-white ring-2 ${open ? 'ring-primary-600' : 'ring-surface'}`}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-4 w-[calc(100vw-2rem)] overflow-hidden animate-slide-down rounded-3xl border border-border bg-surface shadow-2xl sm:w-[400px]">
          <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-5">
            <div>
              <h3 className="text-sm font-black leading-none text-text-main">Notificaciones</h3>
              <p className="mt-1.5 text-[10px] font-extrabold uppercase tracking-widest leading-none text-text-muted">
                {unread} pendientes
              </p>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => void markAll.mutateAsync()}
                disabled={markAll.isPending || unread === 0}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary-700 transition-all hover:text-primary-800 disabled:opacity-40 dark:text-primary-600 dark:hover:text-primary-600"
              >
                <Check size={14} strokeWidth={3} />
                Leer todo
              </button>
            )}
          </div>

          <div className="max-h-[420px] divide-y divide-border/50 overflow-y-auto overscroll-contain scrollbar-hide">
            {listQ.isLoading ? (
              <div className="space-y-4 p-5">
                <div className="skeleton h-16 w-full" />
                <div className="skeleton h-16 w-full" />
                <div className="skeleton h-16 w-full" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 rounded-3xl bg-surface-soft p-5 text-text-subtle">
                  <BellOff size={40} strokeWidth={1.5} />
                </div>
                <p className="text-base font-black text-text-main">Todo al día</p>
                <p className="mt-1 text-sm text-balance text-text-subtle">
                  No tenés notificaciones nuevas.
                </p>
              </div>
            ) : (
              items.map((n) => {
                const Icon = NOTIF_ICONS[n.type] || Bell
                const colorClass = NOTIF_COLORS[n.type] || 'text-text-muted bg-surface-soft'
                const href = notificationHref(n.type)
                const isIpc = n.type === 'NEW_IPC'

                return (
                  <article
                    key={n.id}
                    className={`group relative flex gap-4 p-5 transition-all hover:bg-surface-soft ${
                      n.isRead ? 'bg-surface' : 'bg-primary-50/60 dark:bg-primary-50/40'
                    }`}
                  >
                    {!n.isRead && (
                      <div className="absolute top-0 left-0 h-full w-1.5 bg-primary-600" />
                    )}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
                    >
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm leading-tight transition-colors ${n.isRead ? 'font-bold text-text-muted' : 'font-black text-text-main'}`}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[10px] font-bold text-text-muted">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`mt-1.5 text-xs leading-relaxed ${n.isRead ? 'text-text-muted' : 'text-text-main/80'}`}
                      >
                        {n.body}
                      </p>
                      <NotificationMetaChips n={n} />
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {!n.isRead ? (
                          <button
                            type="button"
                            onClick={() => void markOne.mutateAsync(n.id)}
                            className="text-[10px] font-black uppercase tracking-widest text-primary-700 transition-all hover:text-primary-800 active:scale-95 dark:text-primary-600"
                          >
                            Marcar como leída
                          </button>
                        ) : (
                          <span />
                        )}
                        {isIpc ? (
                          <button
                            type="button"
                            onClick={() => openIpcBreakdown(n)}
                            className="inline-flex items-center gap-1 rounded-lg bg-accent-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-accent-700 transition-colors hover:bg-accent-100 dark:text-accent-500"
                          >
                            Ver rubros
                            <ChevronRight size={12} />
                          </button>
                        ) : href ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (!n.isRead) void markOne.mutateAsync(n.id)
                              setOpen(false)
                              void navigate(href)
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary-800 transition-colors hover:bg-primary-100 dark:text-primary-600"
                          >
                            Ver
                            <ChevronRight size={12} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>

          <div className="border-t border-border bg-surface-soft p-4 text-center">
            <Link
              to="/history"
              onClick={() => setOpen(false)}
              className="text-[10px] font-black uppercase tracking-widest text-text-muted transition-all hover:text-primary-700 dark:hover:text-primary-600"
            >
              Ver historial de índices
            </Link>
          </div>
        </div>
      ) : null}

      <IpcBreakdownModal
        open={Boolean(ipcModal)}
        periodIso={ipcModal?.periodIso ?? null}
        initialSeries={ipcModal?.series ?? null}
        generalPct={ipcModal?.generalPct ?? null}
        onClose={() => setIpcModal(null)}
      />
    </div>
  )
}
