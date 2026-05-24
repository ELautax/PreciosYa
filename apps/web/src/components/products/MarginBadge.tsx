import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import type { MarginStatusLevel } from '@/types/product'

type MarginBadgeProps = {
  marginPct: number
  marginStatus?: MarginStatusLevel
  isAlert?: boolean
}

export function MarginBadge({ marginPct, marginStatus, isAlert }: MarginBadgeProps) {
  const status: MarginStatusLevel =
    marginStatus ?? (isAlert ? 'LOW' : 'OK')

  if (status === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-danger-200 bg-danger-50 px-2.5 py-1 text-xs font-black font-mono text-danger-700 shadow-xs dark:border-danger-800/30 dark:bg-danger-900/20">
        <AlertTriangle size={12} strokeWidth={3} />
        {marginPct.toFixed(1)}%
      </span>
    )
  }

  if (status === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-xs font-black font-mono text-accent-700 shadow-xs dark:border-accent-800/30 dark:bg-accent-900/20">
        <AlertTriangle size={12} strokeWidth={3} className="text-accent-600" />
        {marginPct.toFixed(1)}%
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-black font-mono text-primary-700 shadow-xs dark:border-primary-800/30 dark:bg-primary-900/20">
      <CheckCircle2 size={12} strokeWidth={3} className="text-primary-600" />
      {marginPct.toFixed(1)}%
    </span>
  )
}
