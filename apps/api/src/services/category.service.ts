import type { Category, CategoryTemplate } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { assertLocalOwnership } from './local.service.js'
import { AppError } from '../utils/AppError.js'

export function serializeCategory(
  c: Category & { template?: CategoryTemplate | null },
) {
  return {
    id: c.id,
    localId: c.localId,
    templateId: c.templateId,
    name: c.name,
    colorHex: c.colorHex ?? '#16A34A',
    preferredIndex: c.preferredIndex,
    isActive: c.isActive,
    templateSlug: c.template?.slug ?? null,
    createdAt: c.createdAt.toISOString(),
  }
}

export async function seedCategoriesFromTemplates(localId: string): Promise<void> {
  const templates = await prisma.categoryTemplate.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  if (templates.length === 0) return

  const existing = await prisma.category.count({ where: { localId } })
  if (existing > 0) return

  await prisma.category.createMany({
    data: templates.map((t) => ({
      localId,
      templateId: t.id,
      name: t.name,
      colorHex: t.colorHex,
      preferredIndex: t.preferredIndex,
      isActive: t.slug !== 'otros',
    })),
  })
}

export async function ensureCategoriesSeeded(userId: string, localId: string): Promise<void> {
  await assertLocalOwnership(userId, localId)
  await seedCategoriesFromTemplates(localId)
}

export async function getCategories(userId: string, localId: string) {
  await ensureCategoriesSeeded(userId, localId)
  const rows = await prisma.category.findMany({
    where: { localId },
    include: { template: true },
    orderBy: { name: 'asc' },
  })
  return rows.map(serializeCategory)
}

export async function setCategoryActive(
  userId: string,
  categoryId: string,
  isActive: boolean,
) {
  const cat = await prisma.category.findFirst({
    where: { id: categoryId },
    include: { local: true, template: true },
  })
  if (!cat || cat.local.userId !== userId || !cat.local.isActive) {
    throw new AppError({
      statusCode: 404,
      message: 'Categoría no encontrada',
      code: 'CATEGORY_NOT_FOUND',
    })
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { isActive },
    include: { template: true },
  })
  return serializeCategory(updated)
}

export async function listCategoryTemplates() {
  const rows = await prisma.categoryTemplate.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  return rows.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    colorHex: t.colorHex,
    preferredIndex: t.preferredIndex,
    sortOrder: t.sortOrder,
  }))
}
