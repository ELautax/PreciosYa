import type { Local, User } from '@prisma/client'

import { isWithinLimit, maxLocalsForPlan } from '../lib/planLimits.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/AppError.js'

export function serializeLocal(l: Local) {
  return {
    id: l.id,
    userId: l.userId,
    name: l.name,
    address: l.address,
    minMarginPct: Number(l.minMarginPct),
    currency: l.currency,
    isActive: l.isActive,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }
}

export async function getLocalsForUser(userId: string): Promise<Local[]> {
  return prisma.local.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function assertLocalOwnership(
  userId: string,
  localId: string,
): Promise<Local> {
  const local = await prisma.local.findFirst({
    where: { id: localId, userId, isActive: true },
  })
  if (!local) {
    throw new AppError({
      statusCode: 404,
      message: 'Local no encontrado',
      code: 'LOCAL_NOT_FOUND',
    })
  }
  return local
}

export async function createLocal(
  user: User,
  input: { name: string; address?: string | null | undefined },
): Promise<Local> {
  const count = await prisma.local.count({
    where: { userId: user.id, isActive: true },
  })
  const max = maxLocalsForPlan(user.plan)
  if (!isWithinLimit(count, max)) {
    throw new AppError({
      statusCode: 403,
      message: 'Alcanzaste el máximo de locales para tu plan',
      code: 'LOCAL_LIMIT_REACHED',
    })
  }

  return prisma.local.create({
    data: {
      userId: user.id,
      name: input.name.trim(),
      address:
        input.address === undefined || input.address === null || input.address === ''
          ? null
          : input.address.trim(),
    },
  })
}
