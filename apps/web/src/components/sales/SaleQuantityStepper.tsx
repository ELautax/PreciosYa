import { Minus, Plus } from 'lucide-react'

type SaleQuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  step?: number
}

export function SaleQuantityStepper({ value, onChange, step = 1 }: SaleQuantityStepperProps) {
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
      <span className="min-w-[3rem] text-center font-mono text-lg font-black text-text-main">{value}</span>
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
