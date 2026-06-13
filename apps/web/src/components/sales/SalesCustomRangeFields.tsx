type SalesCustomRangeFieldsProps = {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}

export function SalesCustomRangeFields({
  from,
  to,
  onFromChange,
  onToChange,
}: SalesCustomRangeFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-subtle">
          Desde
        </span>
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onFromChange(e.target.value)}
          className="min-h-[48px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-main"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-subtle">
          Hasta
        </span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onToChange(e.target.value)}
          className="min-h-[48px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-main"
        />
      </label>
    </div>
  )
}
