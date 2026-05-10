import { useEffect, useState } from 'react'

import { subscribeToasts } from '@/lib/toast'
import type { ToastItem } from '@/lib/toast'

const TOAST_TTL_MS = 2600

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

  if (items.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-2">
      {items.map((item) => {
        const toneClasses =
          item.tone === 'success'
            ? 'border-green-300 bg-green-50 text-green-900'
            : item.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-stone-300 bg-white text-stone-900'
        return (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-md ${toneClasses}`}
            role="status"
            aria-live="polite"
          >
            {item.message}
          </div>
        )
      })}
    </div>
  )
}

