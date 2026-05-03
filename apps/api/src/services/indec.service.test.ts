import { AppError } from '../utils/AppError.js'
import {
  fetchLatestIPCFromApi,
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

  it('lanza parse error para payload inválido', () => {
    expect(() => parseIndecSeriesResponse({ nope: true })).toThrow(AppError)
  })

  it('fetchLatestIPCFromApi usa endpoint y parsea respuesta', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ series: [{ fecha: '2026-03-01', valor: 4.1 }] }],
        }),
      }),
    )

    const result = await fetchLatestIPCFromApi()
    expect(result.valuePct).toBe(4.1)
    expect(result.period.toISOString()).toBe('2026-03-01T00:00:00.000Z')
    expect(result.sourceUrl).toContain('/series/?ids=')
  })
})
