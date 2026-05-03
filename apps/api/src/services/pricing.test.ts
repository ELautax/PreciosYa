import {
  applyIPC,
  calculateSalePrice,
  isMarginAlert,
} from 'shared'

describe('pricing helpers', () => {
  it('calculateSalePrice redondea a múltiplos de 10', () => {
    expect(calculateSalePrice(103, 27)).toBe(130)
  })

  it('applyIPC devuelve diferencias correctas', () => {
    const result = applyIPC(100, 12.5)
    expect(result).toEqual({
      previousCost: 100,
      newCost: 112.5,
      appliedIpc: 12.5,
      differenceAmount: 12.5,
    })
  })

  it('isMarginAlert marca debajo del mínimo', () => {
    expect(isMarginAlert(19.99, 20)).toBe(true)
    expect(isMarginAlert(20, 20)).toBe(false)
  })
})
