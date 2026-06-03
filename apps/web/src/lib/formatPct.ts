/** Formatea % IPC evitando crash si el API devuelve string o null. */
export function formatPct(value: unknown, digits = 2): string {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '—'
  return n.toFixed(digits)
}

export function toPctNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}
