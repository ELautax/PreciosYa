type MarginBadgeProps = {
  marginPct: number
  isAlert: boolean
}

export function MarginBadge({ marginPct, isAlert }: MarginBadgeProps) {
  const cls = isAlert
    ? 'border-red-200 bg-red-50 text-red-800'
    : 'border-green-300 bg-green-50 text-green-900'

  return (
    <span
      className={`mono inline-flex rounded-full border px-2 py-1 text-sm font-medium ${cls}`}
    >
      {marginPct.toFixed(1)}%
    </span>
  )
}
