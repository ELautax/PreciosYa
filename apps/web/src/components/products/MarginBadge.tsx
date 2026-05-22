import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react'

type MarginBadgeProps = {
  marginPct: number
  isAlert: boolean
}

export function MarginBadge({ marginPct, isAlert }: MarginBadgeProps) {
  const isNegative = marginPct < 0
  const isVeryLow = marginPct < 10 && !isNegative

  if (isAlert || isNegative) {
    return (
      <span 
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black font-mono shadow-xs transition-all ${
          isNegative 
            ? 'border-danger-300 bg-danger-100 text-danger-800 animate-pulse' 
            : 'border-danger-200 bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:border-danger-800/30'
        }`}
      >
        {isNegative ? <TrendingDown size={12} strokeWidth={3} /> : <AlertTriangle size={12} strokeWidth={3} />}
        {marginPct.toFixed(1)}%
      </span>
    )
  }

  if (isVeryLow) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-xs font-black font-mono text-accent-700 shadow-xs dark:bg-accent-900/20 dark:border-accent-800/30">
        <AlertTriangle size={12} strokeWidth={3} className="text-accent-600" />
        {marginPct.toFixed(1)}%
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-black font-mono text-primary-700 shadow-xs dark:bg-primary-900/20 dark:border-primary-800/30">
      <CheckCircle2 size={12} strokeWidth={3} className="text-primary-600" />
      {marginPct.toFixed(1)}%
    </span>
  )
}
