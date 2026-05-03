import { useState } from 'react'

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationsRealtimeSync,
  useUnreadNotificationsCount,
} from '@/hooks/useNotifications'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('es-AR')
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  useNotificationsRealtimeSync()
  const listQ = useNotifications(1)
  const unreadQ = useUnreadNotificationsCount()
  const markOne = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const unread = unreadQ.data ?? 0
  const items = listQ.data?.items ?? []

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
      >
        Notificaciones
        {unread > 0 ? (
          <span className="ml-2 inline-flex min-w-5 justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[360px] rounded-xl border border-stone-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900">Centro de notificaciones</h3>
            <button
              type="button"
              onClick={() => void markAll.mutateAsync()}
              disabled={markAll.isPending || items.length === 0}
              className="text-xs text-green-700 hover:underline disabled:text-stone-400"
            >
              Marcar todas
            </button>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {listQ.isLoading ? (
              <p className="text-sm text-stone-600">Cargando…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-stone-500">No hay notificaciones.</p>
            ) : (
              items.map((n) => (
                <article
                  key={n.id}
                  className={`rounded-lg border p-2 ${
                    n.isRead ? 'border-stone-200 bg-white' : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{n.title}</p>
                      <p className="text-xs text-stone-700">{n.body}</p>
                      <p className="mt-1 text-[11px] text-stone-500">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead ? (
                      <button
                        type="button"
                        onClick={() => void markOne.mutateAsync(n.id)}
                        className="shrink-0 text-[11px] text-green-700 hover:underline"
                      >
                        Marcar
                      </button>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
