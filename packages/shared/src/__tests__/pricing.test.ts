import { describe, expect, it } from 'vitest'

import {
  applyIPC,
  applyPercentageIncrease,
  bulkUpdateCosts,
  calculateMarginPct,
  calculateSalePrice,
  isMarginAlert,
} from '../pricing'

describe('calculateSalePrice', () => {
  it('redondea al diez más cercano', () => {
    expect(calculateSalePrice(100, 20)).toBe(120)
    expect(calculateSalePrice(100, 23)).toBe(120)
    expect(calculateSalePrice(33, 10)).toBe(40)
    expect(calculateSalePrice(100, 25)).toBe(130)
  })

  it('rechaza cost <= 0', () => {
    expect(() => calculateSalePrice(0, 10)).toThrow()
    expect(() => calculateSalePrice(-1, 10)).toThrow()
  })

  it('rechaza margen negativo', () => {
    expect(() => calculateSalePrice(100, -1)).toThrow()
  })

  it('permite margen 0', () => {
    expect(calculateSalePrice(100, 0)).toBe(100)
  })
})

describe('calculateMarginPct', () => {
  it('calcula margen sobre costo', () => {
    expect(calculateMarginPct(100, 150)).toBe(50)
  })

  it('rechaza cost <= 0', () => {
    expect(() => calculateMarginPct(0, 100)).toThrow()
  })
})

describe('applyPercentageIncrease', () => {
  it('aumento porcentual con 2 decimales', () => {
    expect(applyPercentageIncrease(100, 10)).toBe(110)
    expect(applyPercentageIncrease(50, 5)).toBe(52.5)
  })

  it('ipc 0 deja el costo', () => {
    expect(applyPercentageIncrease(100, 0)).toBe(100)
  })

  it('ipc negativo reduce costo', () => {
    expect(applyPercentageIncrease(100, -10)).toBe(90)
  })

  it('rechaza cost <= 0', () => {
    expect(() => applyPercentageIncrease(0, 10)).toThrow()
  })
})

describe('applyIPC', () => {
  it('devuelve resultado consistente', () => {
    const r = applyIPC(100, 12.5)
    expect(r.previousCost).toBe(100)
    expect(r.newCost).toBe(112.5)
    expect(r.appliedIpc).toBe(12.5)
    expect(r.differenceAmount).toBe(12.5)
  })
})

describe('isMarginAlert', () => {
  it('true si margen por debajo del mínimo', () => {
    expect(isMarginAlert(15, 20)).toBe(true)
    expect(isMarginAlert(20, 20)).toBe(false)
  })
})

describe('bulkUpdateCosts', () => {
  it('array vacío', () => {
    expect(bulkUpdateCosts([], 10)).toEqual([])
  })

  it('actualiza costos y precio de venta', () => {
    const out = bulkUpdateCosts(
      [
        { id: 'a', cost: 100, marginPct: 20 },
        { id: 'b', cost: 200, marginPct: 10 },
      ],
      10,
    )
    expect(out).toHaveLength(2)
    expect(out[0]).toMatchObject({
      id: 'a',
      previousCost: 100,
      newCost: 110,
      salePrice: 130,
    })
    expect(out[1].newCost).toBe(220)
  })
})
