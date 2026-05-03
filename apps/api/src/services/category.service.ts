import type { Category } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { assertLocalOwnership } from './local.service.js'
import { AppError } from '../utils/AppError.js'

function isPrismaUniqueViolation(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'P2002'
  )
}

export function serializeCategory(c: Category) {
  return {
    id: c.id,
    localId: c.localId,
    name: c.name,
    colorHex: c.colorHex ?? '#16A34A',
    createdAt: c.createdAt.toISOString(),
  }
}

export async function getCategories(userId: string, localId: string) {
  await assertLocalOwnership(userId, localId)
  const rows = await prisma.category.findMany({
    where: { localId },
    orderBy: { name: 'asc' },
  })
  return rows.map(serializeCategory)
}

export async function createCategory(
  userId: string,
  input: { localId: string; name: string; colorHex?: string | null },
) {
  await assertLocalOwnership(userId, input.localId)
  try {
    const c = await prisma.category.create({
      data: {
        localId: input.localId,
        name: input.name.trim(),
        colorHex: input.colorHex ?? '#16A34A',
      },
    })
    return serializeCategory(c)
  } catch (e) {
    if (isPrismaUniqueViolation(e)) {
      throw new AppError({
        statusCode: 409,
        message: 'Ya existe una categoría con ese nombre en este local',
        code: 'CATEGORY_DUPLICATE',
      })
    }
    throw e
  }
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: { name?: string; colorHex?: string | null },
) {
  const cat = await prisma.category.findFirst({
    where: { id: categoryId },
    include: { local: true },
  })
  if (!cat || cat.local.userId !== userId || !cat.local.isActive) {
    throw new AppError({
      statusCode: 404,
      message: 'Categoría no encontrada',
      code: 'CATEGORY_NOT_FOUND',
    })
  }

  try {
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.colorHex !== undefined ? { colorHex: input.colorHex } : {}),
      },
    })
    return serializeCategory(updated)
  } catch (e) {
    if (isPrismaUniqueViolation(e)) {
      throw new AppError({
        statusCode: 409,
        message: 'Ya existe una categoría con ese nombre en este local',
        code: 'CATEGORY_DUPLICATE',
      })
    }
    throw e
  }
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  const cat = await prisma.category.findFirst({
    where: { id: categoryId },
    include: { local: true },
  })
  if (!cat || cat.local.userId !== userId || !cat.local.isActive) {
    throw new AppError({
      statusCode: 404,
      message: 'Categoría no encontrada',
      code: 'CATEGORY_NOT_FOUND',
    })
  }
  await prisma.category.delete({ where: { id: categoryId } })
}
