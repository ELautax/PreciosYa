import { IPC_INDEX_LABELS } from '@/lib/ipcLabels'

export function isUsdIndex(preferredIndex: string | null | undefined): boolean {
  return Boolean(preferredIndex?.startsWith('BCRA_'))
}

export function categoryIndexLabel(preferredIndex: string | null | undefined): string {
  if (!preferredIndex) return 'IPC general (sin rubro)'
  if (isUsdIndex(preferredIndex)) return 'Dólar oficial BCRA'
  return IPC_INDEX_LABELS[preferredIndex] ?? 'IPC por rubro'
}

export function categoryIndexBadgeClass(preferredIndex: string | null | undefined): string {
  if (isUsdIndex(preferredIndex)) {
    return 'border-primary-200 bg-primary-50 text-primary-800 dark:bg-primary-900/20 dark:border-primary-800/40'
  }
  return 'border-accent-200 bg-accent-50 text-accent-800 dark:bg-accent-900/20 dark:border-accent-800/40'
}

/** IPC mensual: mismo mes calendario (UTC). USD: mismo día (UTC). */
export function isIndexPeriodApplied(
  indexPeriodIso: string | null | undefined,
  lastAppliedIso: string | null | undefined,
  mode: 'monthly' | 'daily',
): boolean {
  if (!indexPeriodIso || !lastAppliedIso) return false
  const index = new Date(indexPeriodIso)
  const applied = new Date(lastAppliedIso)
  if (Number.isNaN(index.getTime()) || Number.isNaN(applied.getTime())) return false
  if (mode === 'daily') {
    return index.toISOString().slice(0, 10) === applied.toISOString().slice(0, 10)
  }
  return (
    index.getUTCFullYear() === applied.getUTCFullYear() &&
    index.getUTCMonth() === applied.getUTCMonth()
  )
}

export function formatIndexMonth(periodIso: string): string {
  const d = new Date(periodIso)
  if (Number.isNaN(d.getTime())) return periodIso
  return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}
