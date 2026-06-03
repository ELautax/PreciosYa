import type { Category, CategoryTemplate } from '@prisma/client'
import { IndexType } from '@prisma/client'

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

/** Alinea preferred_index con la plantilla COICOP (rubros creados antes de v2 quedaban en IPC general). */
export async function syncCategoryPreferredIndexFromTemplates(localId: string): Promise<void> {
  const cats = await prisma.category.findMany({
    where: {
      localId,
      templateId: { not: null },
      preferredIndex: { notIn: [IndexType.BCRA_USD_OFICIAL, IndexType.BCRA_USD_MEP] },
    },
    include: { template: true },
  })
  for (const c of cats) {
    if (!c.template || c.preferredIndex === c.template.preferredIndex) continue
    await prisma.category.update({
      where: { id: c.id },
      data: { preferredIndex: c.template.preferredIndex },
    })
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
  await syncCategoryPreferredIndexFromTemplates(localId)
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

export async function updateCategory(
  userId: string,
  categoryId: string,
  patch: { isActive?: boolean; indexByUsd?: boolean },
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

  const data: { isActive?: boolean; preferredIndex?: IndexType } = {}
  if (patch.isActive !== undefined) data.isActive = patch.isActive
  if (patch.indexByUsd !== undefined) {
    if (patch.indexByUsd) {
      data.preferredIndex = IndexType.BCRA_USD_OFICIAL
    } else if (cat.template) {
      data.preferredIndex = cat.template.preferredIndex
    } else {
      data.preferredIndex = IndexType.IPC_INDEC
    }
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data,
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
