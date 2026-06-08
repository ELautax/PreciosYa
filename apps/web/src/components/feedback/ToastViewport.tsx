import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

import { subscribeToasts } from '@/lib/toast'
import type { ToastItem, ToastTone } from '@/lib/toast'

const TOAST_CONFIG: Record<ToastTone, { icon: any; color: string; bg: string; border: string }> = {
  success: { 
    icon: CheckCircle2, 
    color: 'text-primary-600', 
    bg: 'bg-primary-50/50 dark:bg-primary-900/10', 
    border: 'border-primary-100 dark:border-primary-800/30' 
  },
  error: { 
    icon: AlertCircle, 
    color: 'text-danger-600', 
    bg: 'bg-danger-50/50 dark:bg-danger-900/10', 
    border: 'border-danger-100 dark:border-danger-800/30' 
  },
  info: { 
    icon: Info, 
    color: 'text-accent-600', 
    bg: 'bg-accent-50/50 dark:bg-accent-900/10', 
    border: 'border-accent-100 dark:border-accent-800/30' 
  },
}

const TOAST_TTL_MS = 4000

export function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    return subscribeToasts((toast) => {
      setItems((prev) => [...prev, toast])
      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== toast.id))
      }, TOAST_TTL_MS)
    })
  }, [])

  const remove = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (items.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      {items.map((item) => {
        const config = TOAST_CONFIG[item.tone]
        const Icon = config.icon

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 animate-slide-down rounded-2xl border ${config.border} ${config.bg} p-4 shadow-warm-lg backdrop-blur-md transition-all`}
            role="status"
            aria-live="polite"
          >
            <div className={`mt-1 shrink-0 ${config.color}`}>
              <Icon size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1 text-sm font-bold text-text-main leading-tight pt-1">
              {item.message}
            </div>
            <button
              onClick={() => remove(item.id)}
              className="shrink-0 rounded-xl p-3 text-text-subtle transition-colors hover:bg-black/5 hover:text-text-main active:scale-90"
              aria-label="Cerrar notificación"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
