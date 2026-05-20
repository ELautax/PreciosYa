import { AppError } from '../utils/AppError.js'
import {
  fetchLatestIPCFromApi,
  normalizeIndecPercentValue,
  parseIndecSeriesResponse,
} from './indec.service.js'

describe('indec.service', () => {
  it('parsea formato data.series con fecha/valor', () => {
    const parsed = parseIndecSeriesResponse({
      data: [
        {
          series: [{ fecha: '2026-05-01', valor: '3,7' }],
        },
      ],
    })

    expect(parsed.valuePct).toBe(3.7)
    expect(parsed.period.toISOString()).toBe('2026-05-01T00:00:00.000Z')
  })

  it('parsea formato results tuple', () => {
    const parsed = parseIndecSeriesResponse({
      results: [['2026-04-01', 2.5]],
    })
    expect(parsed.valuePct).toBe(2.5)
    expect(parsed.period.toISOString()).toBe('2026-04-01T00:00:00.000Z')
  })

  it('parsea formato data como lista de tuplas (datos.gob.ar)', () => {
    const parsed = parseIndecSeriesResponse({
      data: [
        ['2026-01-01', 0.02881619353661713],
        ['2026-02-01', 0.02896319072672693],
      ],
    })
    expect(parsed.valuePct).toBeCloseTo(0.02896319072672693, 10)
    expect(parsed.period.toISOString()).toBe('2026-02-01T00:00:00.000Z')
  })

  it('normaliza fracción percent_change a puntos porcentuales', () => {
    expect(normalizeIndecPercentValue(0.0289)).toBe(2.89)
    expect(normalizeIndecPercentValue(4.1)).toBe(4.1)
  })

  it('lanza parse error para payload inválido', () => {
    expect(() => parseIndecSeriesResponse({ nope: true })).toThrow(AppError)
  })

  it('fetchLatestIPCFromApi usa last=1 y percent_change', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [['2026-02-01', 0.02896319072672693]],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchLatestIPCFromApi()
    expect(result.valuePct).toBeCloseTo(2.896, 2)
    expect(result.period.toISOString()).toBe('2026-02-01T00:00:00.000Z')
    const calledUrl = String(fetchMock.mock.calls[0]?.[0])
    expect(calledUrl).toContain('percent_change')
    expect(calledUrl).toContain('last=1')
  })
})
