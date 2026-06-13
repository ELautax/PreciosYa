import { describe, expect, it } from 'vitest'

import {
  averageTicket,
  lineMarginPct,
  lineProfit,
  lineRevenue,
} from '../sales.js'

describe('lineRevenue', () => {
  it('calcula ingreso por línea', () => {
    expect(lineRevenue(1500, 3)).toBe(4500)
  })

  it('rechaza cantidad inválida', () => {
    expect(() => lineRevenue(100, 0)).toThrow()
    expect(() => lineRevenue(100, -1)).toThrow()
  })
})

describe('lineProfit', () => {
  it('calcula ganancia con snapshot de costo', () => {
    expect(lineProfit(1500, 1000, 2)).toBe(1000)
  })

  it('refleja margen histórico aunque el costo actual haya cambiado', () => {
    const profitAtSale = lineProfit(1500, 800, 1)
    expect(profitAtSale).toBe(700)
    expect(lineProfit(1500, 1200, 1)).toBe(300)
  })
})

describe('averageTicket', () => {
  it('calcula ticket promedio', () => {
    expect(averageTicket(10000, 4)).toBe(2500)
  })

  it('devuelve 0 sin ventas', () => {
    expect(averageTicket(0, 0)).toBe(0)
  })
})

describe('lineMarginPct', () => {
  it('calcula margen porcentual', () => {
    expect(lineMarginPct(1200, 1000)).toBe(20)
  })
})
