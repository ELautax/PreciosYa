import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'

import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * Verifica que el recurso pertenezca al usuario autenticado.
 * Pasá una función que resuelva el `user_id` dueño del recurso (o null si no existe).
 */
export function requireOwnership(
  loadOwnerUserId: (req: Request) => Promise<string | null>,
): RequestHandler {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      const user = req.user
      if (!user) {
        throw new AppError({
          statusCode: 401,
          message: 'No autenticado',
          code: 'UNAUTHORIZED',
        })
      }
      const ownerId = await loadOwnerUserId(req)
      if (!ownerId) {
        throw new AppError({
          statusCode: 404,
          message: 'Recurso no encontrado',
          code: 'NOT_FOUND',
        })
      }
      if (ownerId !== user.id) {
        throw new AppError({
          statusCode: 403,
          message: 'No tenés permiso sobre este recurso',
          code: 'FORBIDDEN',
        })
      }
      next()
    },
  )
}
