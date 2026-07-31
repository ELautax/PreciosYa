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

const NOTIF_COLORS: Record<string, string> = {
  NEW_IPC: 'text-accent-700 bg-accent-50 dark:bg-accent-900/20',
  BCRA_USD_ALERT: 'text-primary-700 bg-primary-50 dark:bg-primary-900/20',
  MARGIN_ALERT: 'text-danger-600 bg-danger-50 dark:bg-danger-900/20',
  PLAN_EXPIRING: 'text-accent-600 bg-accent-50 dark:bg-accent-900/20',
  PLAN_EXPIRED: 'text-danger-700 bg-danger-100 dark:bg-danger-900/40',
  WELCOME: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
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

function notificationHref(type: string): string | null {
  if (type === 'NEW_IPC' || type === 'BCRA_USD_ALERT') return '/products'
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
    if (pct === null && !period) return null
    return (
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {pct !== null ? (
          <span className="inline-flex items-center rounded-lg border border-accent-200 bg-accent-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-accent-800 dark:border-accent-800/40 dark:bg-accent-900/20 dark:text-accent-100">
            IPC general +{formatPct(pct)}%
          </span>
        ) : null}
        {period ? (
          <span className="inline-flex items-center rounded-lg border border-border bg-surface-soft px-2 py-1 text-[10px] font-black uppercase tracking-wide text-text-muted">
            {formatIndexMonth(period)}
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
          <span className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-primary-800 dark:border-primary-800/40 dark:bg-primary-900/20 dark:text-primary-100">
            USD ${formatArsRate(rate)}
          </span>
        ) : null}
        {pct !== null ? (
          <span className="inline-flex items-center rounded-lg border border-border bg-surface-soft px-2 py-1 text-[10px] font-black uppercase tracking-wide text-text-muted">
            {pct >= 0 ? '+' : ''}
            {formatPct(pct)}% vs ayer
          </span>
        ) : null}
      </div>
    )
  }

  return null
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

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
        <div className="absolute right-0 z-50 mt-4 w-[calc(100vw-2rem)] sm:w-[400px] overflow-hidden animate-slide-down rounded-3xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-5">
            <div>
              <h3 className="text-sm font-black text-text-main leading-none">Notificaciones</h3>
              <p className="mt-1.5 text-[10px] font-extrabold text-text-subtle uppercase tracking-widest leading-none">
                {unread} pendientes
              </p>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => void markAll.mutateAsync()}
                disabled={markAll.isPending || unread === 0}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 disabled:opacity-30 transition-all"
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
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="mb-4 rounded-3xl bg-surface-soft p-5 text-text-subtle">
                  <BellOff size={40} strokeWidth={1.5} />
                </div>
                <p className="text-base font-black text-text-main">Todo al día</p>
                <p className="mt-1 text-sm text-text-subtle text-balance">
                  No tenés notificaciones nuevas.
                </p>
              </div>
            ) : (
              items.map((n) => {
                const Icon = NOTIF_ICONS[n.type] || Bell
                const colorClass = NOTIF_COLORS[n.type] || 'text-text-muted bg-surface-soft'
                const href = notificationHref(n.type)

                return (
                  <article
                    key={n.id}
                    className={`group relative flex gap-4 p-5 transition-all hover:bg-surface-soft/50 ${
                      n.isRead ? 'bg-surface' : 'bg-primary-50/20 dark:bg-primary-900/5'
                    }`}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 h-full w-1.5 bg-primary-600" />
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
                        <span className="shrink-0 text-[10px] font-bold text-text-subtle">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{n.body}</p>
                      <NotificationMetaChips n={n} />
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {!n.isRead ? (
                          <button
                            type="button"
                            onClick={() => void markOne.mutateAsync(n.id)}
                            className="text-[10px] font-black uppercase tracking-widest text-primary-600 transition-all hover:text-primary-700 active:scale-95"
                          >
                            Marcar como leída
                          </button>
                        ) : (
                          <span />
                        )}
                        {href ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (!n.isRead) void markOne.mutateAsync(n.id)
                              setOpen(false)
                              void navigate(href)
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent-700 transition-colors hover:text-accent-800"
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

          <div className="border-t border-border bg-surface-soft/50 p-4 text-center">
            <Link
              to="/history"
              onClick={() => setOpen(false)}
              className="text-[10px] font-black uppercase tracking-widest text-text-subtle transition-all hover:text-primary-700"
            >
              Ver historial de índices
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
