import type { Request, Response } from 'express'

import { AppError } from '../utils/AppError.js'

const { verifyTokenMock, syncUserFromSupabaseMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
  syncUserFromSupabaseMock: vi.fn(),
}))

vi.mock('../lib/supabase.js', () => ({
  verifyToken: verifyTokenMock,
}))

vi.mock('../services/auth.service.js', () => ({
  syncUserFromSupabase: syncUserFromSupabaseMock,
}))

import { authMiddleware } from './auth.middleware.js'

function runMiddleware(req: Partial<Request>) {
  return new Promise<{ err: unknown; req: Partial<Request> }>((resolve) => {
    authMiddleware(
      req as Request,
      {} as Response,
      (err?: unknown) => resolve({ err: err ?? null, req }),
    )
  })
}

describe('authMiddleware', () => {
  it('rechaza request sin bearer token', async () => {
    const { err } = await runMiddleware({ headers: {} })
    expect(err).toBeInstanceOf(AppError)
    expect((err as AppError).code).toBe('UNAUTHORIZED')
  })

  it('inyecta req.user cuando token es válido', async () => {
    verifyTokenMock.mockResolvedValue({ id: 'auth-1' })
    syncUserFromSupabaseMock.mockResolvedValue({
      user: { id: 'user-1', email: 'a@b.com' },
    })

    const req: Partial<Request> = {
      headers: { authorization: 'Bearer token-123' },
    }
    const { err } = await runMiddleware(req)

    expect(err).toBeNull()
    expect(verifyTokenMock).toHaveBeenCalledWith('token-123')
    expect(syncUserFromSupabaseMock).toHaveBeenCalled()
    expect(req.user).toEqual({ id: 'user-1', email: 'a@b.com' })
  })
})
