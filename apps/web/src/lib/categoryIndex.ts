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
    return 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-200 dark:text-primary-600'
  }
  return 'border-accent-200 bg-accent-50 text-accent-700 dark:border-accent-200 dark:text-accent-500'
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

/** Etiqueta mes/año del período IPC (siempre UTC: el corte es 1º del mes 00:00Z). */
export function formatIndexMonth(periodIso: string): string {
  const d = new Date(periodIso)
  if (Number.isNaN(d.getTime())) return periodIso
  return d.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** YYYY-MM del período índice (UTC). */
export function indexPeriodYearMonth(periodIso: string): string | null {
  const d = new Date(periodIso)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
