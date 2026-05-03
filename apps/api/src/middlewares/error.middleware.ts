import type { NextFunction, Request, Response } from 'express'

import { AppError } from '../utils/AppError.js'

import type { ErrorEnvelope } from '../utils/response.js'

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ErrorEnvelope = {
      success: false,
      error: { message: err.message, code: err.code },
    }
    res.status(err.statusCode).json(body)
    return
  }

  console.error(err)
  const body: ErrorEnvelope = {
    success: false,
    error: {
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
    },
  }
  res.status(500).json(body)
}
