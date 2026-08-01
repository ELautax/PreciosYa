import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Tags } from 'lucide-react'

import { CategoryAvatar } from '@/lib/categoryUi'
import type { CategoryDto } from '@/types/category'

type CategorySelectProps = {
  value: string
  onChange: (categoryId: string) => void
  categories: CategoryDto[]
  disabled?: boolean
  loading?: boolean
}

export function CategorySelect({
  value,
  onChange,
  categories,
  disabled = false,
  loading = false,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = categories.find((c) => c.id === value) ?? null

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function pick(next: string) {
    onChange(next)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 text-left transition-colors hover:border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-600/10 disabled:opacity-60"
      >
        {selected ? (
          <CategoryAvatar
            slug={selected.templateSlug}
            fallbackColor={selected.colorHex}
            size={16}
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-text-subtle">
            <Tags size={14} strokeWidth={2.5} />
          </div>
        )}
        <span
          className={`min-w-0 flex-1 truncate text-sm font-bold ${
            selected ? 'text-text-main' : 'text-text-muted'
          }`}
        >
          {loading
            ? 'Cargando rubros…'
            : selected
              ? selected.name
              : 'Sin rubro (IPC general)'}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={2.5}
          className={`shrink-0 text-text-subtle transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-warm-lg animate-scale-in"
        >
          <li role="option" aria-selected={!selected}>
            <button
              type="button"
              onClick={() => pick('')}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                !selected
                  ? 'bg-primary-50 text-primary-800 dark:bg-primary-900/30'
                  : 'hover:bg-surface-soft'
              }`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-text-subtle">
                <Tags size={14} strokeWidth={2.5} />
              </div>
              <span className="min-w-0 flex-1 text-sm font-bold text-text-main">
                Sin rubro (IPC general)
              </span>
              {!selected ? <Check size={16} className="shrink-0 text-primary-600" /> : null}
            </button>
          </li>
          {categories.map((c) => {
            const isSelected = c.id === value
            return (
              <li key={c.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => pick(c.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-primary-50 text-primary-800 dark:bg-primary-900/30'
                      : 'hover:bg-surface-soft'
                  }`}
                >
                  <CategoryAvatar slug={c.templateSlug} fallbackColor={c.colorHex} size={16} />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-text-main">
                    {c.name}
                  </span>
                  {isSelected ? <Check size={16} className="shrink-0 text-primary-600" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
