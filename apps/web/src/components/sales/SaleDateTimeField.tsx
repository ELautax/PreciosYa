import { toDatetimeLocalValue } from '@/components/sales/format'

type SaleDateTimeFieldProps = {
  value: string
  onChange: (value: string) => void
}

export function SaleDateTimeField({ value, onChange }: SaleDateTimeFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle px-1">
        Fecha y hora de la venta
      </label>
      <input
        type="datetime-local"
        value={value || toDatetimeLocalValue()}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  )
}
