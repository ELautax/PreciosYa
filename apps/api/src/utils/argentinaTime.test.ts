import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  endOfArgentinaDay,
  resolvePeriodBounds,
  startOfArgentinaDay,
} from './argentinaTime.js'

describe('argentinaTime — day bounds (ART = UTC−3)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('startOfArgentinaDay at early morning ART includes post-midnight UTC sales', () => {
    // 01/08/2026 00:55 ART = 01/08/2026 03:55 UTC
    vi.setSystemTime(new Date('2026-08-01T03:55:00.000Z'))

    const start = startOfArgentinaDay()
    const end = endOfArgentinaDay()
    expect(start.toISOString()).toBe('2026-08-01T03:00:00.000Z')
    expect(end.toISOString()).toBe('2026-08-02T02:59:59.999Z')

    const sales = [
      new Date('2026-08-01T03:44:00.000Z'),
      new Date('2026-08-01T03:53:52.259Z'),
    ]
    for (const s of sales) {
      expect(s.getTime()).toBeGreaterThanOrEqual(start.getTime())
      expect(s.getTime()).toBeLessThanOrEqual(end.getTime())
    }
  })

  it('resolvePeriodBounds(today) uses start of ART day and now (not end of day)', () => {
    vi.setSystemTime(new Date('2026-08-01T03:55:00.000Z'))
    const { from, to } = resolvePeriodBounds('today')
    expect(from.toISOString()).toBe('2026-08-01T03:00:00.000Z')
    expect(to.toISOString()).toBe('2026-08-01T03:55:00.000Z')
    expect(new Date('2026-08-01T03:53:52.259Z') >= from).toBe(true)
    expect(new Date('2026-08-01T03:53:52.259Z') <= to).toBe(true)
  })

  it('startOfArgentinaDay at exactly midnight ART', () => {
    vi.setSystemTime(new Date('2026-08-01T03:00:00.000Z'))
    expect(startOfArgentinaDay().toISOString()).toBe('2026-08-01T03:00:00.000Z')
  })
})
