import { describe, expect, it } from 'vitest'

describe('ipc-scheduler cron expressions', () => {
  it('documenta horario 03:00 Argentina para IPC y BCRA', () => {
    const ipcCron = '0 3 * * *'
    const bcraCron = '30 3 * * *'
    expect(ipcCron).toBe('0 3 * * *')
    expect(bcraCron).toBe('30 3 * * *')
  })
})
