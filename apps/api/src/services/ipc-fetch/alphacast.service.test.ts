import { IndexType } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import {
  parseAlphacastIpcCsv,
  parseCsvLine,
  resolveMomColumnIndex,
  assertValidAlphacastCsv,
} from './alphacast.service.js'
import { ALPHACAST_MOM_SUFFIX } from './alphacast.config.js'

describe('parseCsvLine', () => {
  it('respeta comas dentro de comillas', () => {
    expect(parseCsvLine('"Vivienda, agua",1.5')).toEqual(['Vivienda, agua', '1.5'])
  })
})

describe('parseAlphacastIpcCsv', () => {
  it('toma la última fila y variación mensual por división', () => {
    const csv = [
      'Date,country,Nivel general - current_prices_mom,Alimentos y bebidas no alcohólicas - current_prices_mom,Bebidas alcohólicas y tabaco - current_prices_mom,Prendas de vestir y calzado - current_prices_mom,"Vivienda, agua, electricidad y otros combustibles - current_prices_mom",Equipamiento y mantenimiento del hogar - current_prices_mom,Salud - current_prices_mom,Transporte - current_prices_mom,Comunicación - current_prices_mom,Recreación y cultura - current_prices_mom,Educación - current_prices_mom,Restaurantes y hoteles - current_prices_mom,Bienes y servicios varios - current_prices_mom',
      '2026-03-01,Argentina,3.38,3.35,2.13,3.11,3.71,3.35,2.92,4.13,2.92,3.56,12.13,3.45,1.69',
      '2026-04-01,Argentina,2.58,1.50,1.87,3.21,3.53,2.89,2.51,4.38,4.06,0.99,4.25,2.60,2.44',
    ].join('\n')

    const rows = parseAlphacastIpcCsv(csv)
    const general = rows.find((r) => r.indexType === IndexType.IPC_INDEC)
    const food = rows.find((r) => r.indexType === IndexType.IPC_INDEC_ALIMENTOS)

    expect(rows).toHaveLength(13)
    expect(general?.valuePct).toBe(2.58)
    expect(food?.valuePct).toBe(1.5)
    expect(general?.period.toISOString().slice(0, 10)).toBe('2026-04-01')
  })

  it('resuelve columnas con espacios o mayúsculas distintas', () => {
    const header = [
      'DATE',
      'country',
      '  Nivel general - current_prices_mom ',
      'Alimentos y bebidas no alcohólicas - CURRENT_PRICES_MOM',
    ]
    expect(resolveMomColumnIndex(header, 'Nivel general', ALPHACAST_MOM_SUFFIX)).toBe(2)
    expect(
      resolveMomColumnIndex(header, 'Alimentos y bebidas no alcohólicas', ALPHACAST_MOM_SUFFIX),
    ).toBe(3)
  })

  it('rechaza CSV de error por plan gratuito agotado', () => {
    const csv = 'error\nYou exceeded your free membership plan. Please upgrade your subscription.\n'
    expect(() => assertValidAlphacastCsv(csv)).toThrow(/plan gratuito agotado/i)
  })
})
