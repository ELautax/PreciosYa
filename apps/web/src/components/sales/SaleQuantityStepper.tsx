import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

type SaleQuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  step?: number
}

export function SaleQuantityStepper({ value, onChange, step = 1 }: SaleQuantityStepperProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))

  function commitDraft() {
    const parsed = Number(draft.replace(',', '.'))
    if (!Number.isFinite(parsed) || parsed < step) {
      setDraft(String(value))
      setEditing(false)
      return
    }
    // Cantidades enteras o con un decimal (kg/l)
    const rounded = Math.round(parsed * 1000) / 1000
    onChange(Math.max(step, rounded))
    setEditing(false)
  }

  return (
    <div className="inline-flex items-center rounded-xl border border-border bg-surface-soft">
      <button
        type="button"
        onClick={() => onChange(Math.max(step, value - step))}
        className="flex h-11 w-11 items-center justify-center text-text-muted hover:text-text-main"
        aria-label="Menos"
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>
      {editing ? (
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={step}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitDraft()
            }
            if (e.key === 'Escape') {
              setDraft(String(value))
              setEditing(false)
            }
          }}
          className="h-11 w-16 border-0 bg-transparent p-0 text-center font-mono text-lg font-black text-text-main shadow-none focus:ring-0"
          aria-label="Cantidad"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(String(value))
            setEditing(true)
          }}
          className="min-w-[3rem] px-1 text-center font-mono text-lg font-black text-text-main"
          title="Tocar para escribir cantidad"
          aria-label={`Cantidad ${value}. Tocar para editar`}
        >
          {value}
        </button>
      )}
      <button
        type="button"
        onClick={() => onChange(value + step)}
        className="flex h-11 w-11 items-center justify-center text-primary-600 hover:text-primary-700"
        aria-label="Más"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  )
}
