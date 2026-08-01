import type { SalesPeriod } from 'shared'
import { FREE_SALES_HISTORY_DAYS } from 'shared'

const TZ = 'America/Argentina/Buenos_Aires'

/**
 * Offset ART → UTC. Argentina no usa DST desde 2009 (siempre UTC−3).
 * Evita bugs de Intl (`hour: 24` a medianoche) que corrían el día y
 * excluían ventas reales del filtro «Hoy».
 */
const ART_OFFSET_HOURS = 3

/** Partes de fecha/hora en Argentina para un instante UTC. */
export function getArgentinaParts(date: Date): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
} {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  })
  const parts = fmt.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0')

  let hour = get('hour')
  // Algunos runtimes aún reportan 24 a las 00:00; normalizar.
  if (hour === 24) hour = 0

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour,
    minute: get('minute'),
  }
}

/** Inicio del día calendario en Argentina (00:00 ART) como Date UTC. */
export function startOfArgentinaDay(date: Date = new Date()): Date {
  const p = getArgentinaParts(date)
  return new Date(Date.UTC(p.year, p.month - 1, p.day, ART_OFFSET_HOURS, 0, 0, 0))
}

/** Fin del día calendario en Argentina (23:59:59.999 ART). */
export function endOfArgentinaDay(date: Date = new Date()): Date {
  const start = startOfArgentinaDay(date)
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
}

export function startOfArgentinaMonth(date: Date = new Date()): Date {
  const p = getArgentinaParts(date)
  return new Date(Date.UTC(p.year, p.month - 1, 1, ART_OFFSET_HOURS, 0, 0, 0))
}

export function validateSoldAt(soldAt: Date): void {
  const now = Date.now()
  const t = soldAt.getTime()
  if (Number.isNaN(t)) {
    throw new Error('soldAt inválido')
  }
  const maxFuture = now + 5 * 60 * 1000
  const minPast = now - 365 * 24 * 60 * 60 * 1000
  if (t > maxFuture) {
    throw new Error('soldAt no puede ser más de 5 minutos en el futuro')
  }
  if (t < minPast) {
    throw new Error('soldAt no puede ser anterior a un año')
  }
}

export type PeriodBounds = { from: Date; to: Date }

export function resolvePeriodBounds(
  period: SalesPeriod,
  customFrom?: Date,
  customTo?: Date,
): PeriodBounds {
  const now = new Date()
  const to = customTo ?? now

  switch (period) {
    case 'today':
      // Hasta «ahora» (no fin de día): coherente con 7d/30d y evita bordes.
      return { from: startOfArgentinaDay(now), to: now }
    case '7d':
      return {
        from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        to,
      }
    case '30d':
      return {
        from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        to,
      }
    case '90d':
      return {
        from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        to,
      }
    case 'month':
      return { from: startOfArgentinaMonth(now), to }
    case 'custom': {
      if (!customFrom) {
        throw new Error('from requerido para period=custom')
      }
      return { from: customFrom, to }
    }
    default:
      return {
        from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        to,
      }
  }
}

/** Ajusta `from` para plan Free (máx. 7 días de historial). */
export function clampFromForFreePlan(from: Date): Date {
  const min = new Date(Date.now() - FREE_SALES_HISTORY_DAYS * 24 * 60 * 60 * 1000)
  return from < min ? min : from
}

/** Etiqueta YYYY-MM-DD en calendario Argentina. */
export function argentinaDateKey(date: Date): string {
  const p = getArgentinaParts(date)
  const m = String(p.month).padStart(2, '0')
  const d = String(p.day).padStart(2, '0')
  return `${p.year}-${m}-${d}`
}
