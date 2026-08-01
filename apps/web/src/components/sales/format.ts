export function fmtArs(value: number): string {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function fmtArsDecimal(value: number): string {
  return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function toDatetimeLocalValue(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Interpreta `datetime-local` siempre como hora local del navegador (no UTC). */
export function fromDatetimeLocalValue(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value.trim())
  if (!match) {
    const fallback = new Date(value)
    if (Number.isNaN(fallback.getTime())) {
      throw new Error('Fecha/hora inválida')
    }
    return fallback
  }
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    match[6] ? Number(match[6]) : 0,
    0,
  )
}

export function toDateInputValue(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Inicio del día local para enviar como `from` en period=custom. */
export function dateInputToIsoStart(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString()
}

/** Fin del día local para enviar como `to` en period=custom. */
export function dateInputToIsoEnd(value: string): string {
  return new Date(`${value}T23:59:59.999`).toISOString()
}

export function defaultCustomRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { from: toDateInputValue(from), to: toDateInputValue(to) }
}
