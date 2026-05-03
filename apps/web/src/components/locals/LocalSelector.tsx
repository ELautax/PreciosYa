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
    <label className="flex items-center gap-2 text-sm text-stone-700">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
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
