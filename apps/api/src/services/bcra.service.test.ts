import { describe, expect, it } from 'vitest'

import {
  computeUsdDailyVariationPct,
  encodeBcraSourceUrl,
  parseBcraUsdCotizacionesResponse,
  parseUsdRateFromSourceUrl,
} from './bcra.service.js'

describe('parseBcraUsdCotizacionesResponse', () => {
  it('extrae cotización USD y ordena por fecha', () => {
    const rows = parseBcraUsdCotizacionesResponse({
      results: [
        {
          fecha: '2026-06-02',
          detalle: [{ codigoMoneda: 'USD', tipoCotizacion: 1427 }],
        },
        {
          fecha: '2026-06-01',
          detalle: [{ codigoMoneda: 'USD', tipoCotizacion: 1426 }],
        },
      ],
    })
    expect(rows).toHaveLength(2)
    expect(rows[0]?.usdRate).toBe(1426)
    expect(rows[1]?.usdRate).toBe(1427)
  })
})

describe('computeUsdDailyVariationPct', () => {
  it('calcula variación porcentual diaria', () => {
    const pct = computeUsdDailyVariationPct(1427, 1426)
    expect(pct).toBeCloseTo(0.07, 2)
  })
})

describe('sourceUrl usdRate', () => {
  it('codifica y decodifica tasa USD', () => {
    const url = encodeBcraSourceUrl('https://api.bcra.gob.ar/cotizaciones', 1427)
    expect(parseUsdRateFromSourceUrl(url)).toBe(1427)
  })
})
