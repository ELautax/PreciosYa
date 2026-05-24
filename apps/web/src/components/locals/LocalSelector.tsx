import type { LocalDto } from '@/types/local'

type LocalSelectorProps = {
  locals: LocalDto[]
  value: string
  onChange: (id: string) => void
  label?: string
}

export function LocalSelector({
  locals,
  value,
  onChange,
  label = 'Local',
}: LocalSelectorProps) {
  if (locals.length <= 1) return null

  return (
    <label className="flex flex-col gap-2 text-sm font-bold text-text-muted sm:flex-row sm:items-center">
      <span className="text-[10px] font-black uppercase tracking-widest text-text-subtle">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[48px] flex-1"
      >
        {locals.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  )
}
