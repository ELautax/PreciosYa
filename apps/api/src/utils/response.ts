import type { Response } from 'express'

import { AppError } from './AppError.js'

export type SuccessEnvelope<T> = {
  success: true
  data: T
}

export type ErrorEnvelope = {
  success: false
  error: {
    message: string
    code: string
  }
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const body: SuccessEnvelope<T> = { success: true, data }
  res.status(statusCode).json(body)
}

export function sendError(
  res: Response,
  error: AppError | Error | unknown,
  fallbackStatus = 500,
): void {
  if (error instanceof AppError) {
    const body: ErrorEnvelope = {
      success: false,
      error: { message: error.message, code: error.code },
    }
    res.status(error.statusCode).json(body)
    return
  }

  const message =
    error instanceof Error ? error.message : 'Error interno del servidor'
  const body: ErrorEnvelope = {
    success: false,
    error: { message, code: 'INTERNAL_ERROR' },
  }
  res.status(fallbackStatus).json(body)
}
