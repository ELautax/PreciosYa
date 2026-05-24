import { Prisma, ProductUnit } from '@prisma/client'
import type { PriceHistory, Product, User } from '@prisma/client'
import { isProductUnit } from 'shared'
import type { ProductUpdateResult } from 'shared'
import {
  bulkUpdateCosts,
  calculateSalePrice,
  getMarginStatus,
} from 'shared'

import { isWithinLimit, maxActiveProductsForPlan } from '../lib/planLimits.js'
import { prisma } from '../lib/prisma.js'
import { assertLocalOwnership } from './local.service.js'
import { AppError } from '../utils/AppError.js'

function toNum(d: Prisma.Decimal | number): number {
  return typeof d === 'number' ? d : d.toNumber()
}

function normalizeUnit(unit?: string): ProductUnit {
  if (unit && isProductUnit(unit)) return unit as ProductUnit
  return ProductUnit.unidad
}

function marginFields(marginPct: number, minMarginPct: number) {
  const marginStatus = getMarginStatus(marginPct, minMarginPct)
  return {
    marginStatus,
    isMarginAlert: marginStatus === 'LOW',
  }
}

export function serializeProduct(p: Product) {
  return {
    id: p.id,
    localId: p.localId,
    categoryId: p.categoryId,
    name: p.name,
    barcode: p.barcode,
    unit: p.unit,
    cost: toNum(p.cost),
    marginPct: toNum(p.marginPct),
    salePrice: toNum(p.salePrice),
    isMarginAlert: p.isMarginAlert,
    marginStatus: p.marginStatus,
    notes: p.notes,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

async function countActiveProductsForUser(userId: string): Promise<number> {
  return prisma.product.count({
    where: {
      isActive: true,
      local: { userId, isActive: true },
    },
  })
}

async function assertProductQuota(user: User): Promise<void> {
  const max = maxActiveProductsForPlan(user.plan)
  if (!isWithinLimit(await countActiveProductsForUser(user.id), max)) {
    throw new AppError({
      statusCode: 403,
      message: 'Alcanzaste el máximo de productos para tu plan',
      code: 'PRODUCT_LIMIT_REACHED',
    })
  }
}

function isPrismaUniqueViolation(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'P2002'
  )
}

export async function getProducts(
  userId: string,
  params: {
    localId: string
    categoryId?: string | undefined
    isAlert?: boolean | undefined
    search?: string | undefined
    page?: number | undefined
    limit?: number | undefined
  },
) {
  await assertLocalOwnership(userId, params.localId)
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(100, Math.max(1, params.limit ?? 20))
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {
    localId: params.localId,
    isActive: true,
    ...(params.categoryId !== undefined && params.categoryId !== ''
      ? { categoryId: params.categoryId }
      : {}),
    ...(params.isAlert === true && { isMarginAlert: true }),
    ...(params.search !== undefined &&
      params.search.trim() !== '' && {
        name: { contains: params.search.trim(), mode: 'insensitive' },
      }),
  }

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    items: items.map(serializeProduct),
    total,
    page,
    limit,
  }
}

export async function getProductById(
  userId: string,
  productId: string,
): Promise<ReturnType<typeof serializeProduct>> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
      local: { userId, isActive: true },
    },
  })
  if (!product) {
    throw new AppError({
      statusCode: 404,
      message: 'Producto no encontrado',
      code: 'PRODUCT_NOT_FOUND',
    })
  }
  return serializeProduct(product)
}

export async function createProduct(
  user: User,
  input: {
    localId: string
    name: string
    unit?: string | undefined
    barcode?: string | null | undefined
    cost: number
    marginPct: number
    categoryId?: string | null | undefined
    notes?: string | null | undefined
  },
): Promise<ReturnType<typeof serializeProduct>> {
  await assertProductQuota(user)
  const local = await assertLocalOwnership(user.id, input.localId)

  if (input.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: input.categoryId, localId: input.localId },
    })
    if (!cat) {
      throw new AppError({
        statusCode: 400,
        message: 'Categoría inválida para este local',
        code: 'INVALID_CATEGORY',
      })
    }
  }

  let salePrice: number
  try {
    salePrice = calculateSalePrice(input.cost, input.marginPct)
  } catch {
    throw new AppError({
      statusCode: 400,
      message: 'Costo o margen inválidos',
      code: 'INVALID_PRICING',
    })
  }

  const margins = marginFields(input.marginPct, Number(local.minMarginPct))

  const barcode =
    input.barcode === undefined || input.barcode === null || input.barcode.trim() === ''
      ? null
      : input.barcode.trim()

  try {
    const product = await prisma.product.create({
      data: {
        localId: input.localId,
        categoryId: input.categoryId ?? null,
        name: input.name.trim(),
        unit: normalizeUnit(input.unit),
        barcode,
        cost: input.cost,
        marginPct: input.marginPct,
        salePrice,
        isMarginAlert: margins.isMarginAlert,
        marginStatus: margins.marginStatus,
        notes:
          input.notes === undefined || input.notes === null || input.notes === ''
            ? null
            : input.notes,
      },
    })
    return serializeProduct(product)
  } catch (e) {
    if (isPrismaUniqueViolation(e)) {
      throw new AppError({
        statusCode: 409,
        message: 'Ya existe un producto con ese código de barras en este local',
        code: 'BARCODE_DUPLICATE',
      })
    }
    throw e
  }
}

export async function updateProduct(
  user: User,
  productId: string,
  input: {
    name?: string | undefined
    unit?: string | undefined
    barcode?: string | null | undefined
    cost?: number | undefined
    marginPct?: number | undefined
    categoryId?: string | null | undefined
    notes?: string | null | undefined
  },
): Promise<ReturnType<typeof serializeProduct>> {
  const existing = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
      local: { userId: user.id, isActive: true },
    },
    include: { local: true },
  })
  if (!existing) {
    throw new AppError({
      statusCode: 404,
      message: 'Producto no encontrado',
      code: 'PRODUCT_NOT_FOUND',
    })
  }

  if (input.categoryId !== undefined && input.categoryId !== null) {
    const cat = await prisma.category.findFirst({
      where: { id: input.categoryId, localId: existing.localId },
    })
    if (!cat) {
      throw new AppError({
        statusCode: 400,
        message: 'Categoría inválida para este local',
        code: 'INVALID_CATEGORY',
      })
    }
  }

  const cost = input.cost ?? toNum(existing.cost)
  const marginPct = input.marginPct ?? toNum(existing.marginPct)

  let salePrice: number
  try {
    salePrice = calculateSalePrice(cost, marginPct)
  } catch {
    throw new AppError({
      statusCode: 400,
      message: 'Costo o margen inválidos',
      code: 'INVALID_PRICING',
    })
  }

  const margins = marginFields(marginPct, Number(existing.local.minMarginPct))

  const barcode =
    input.barcode === undefined
      ? existing.barcode
      : input.barcode === null || input.barcode.trim() === ''
        ? null
        : input.barcode.trim()

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.unit !== undefined ? { unit: normalizeUnit(input.unit) } : {}),
        ...(input.barcode !== undefined ? { barcode } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.notes !== undefined
          ? {
              notes:
                input.notes === null || input.notes === ''
                  ? null
                  : input.notes,
            }
          : {}),
        cost,
        marginPct,
        salePrice,
        isMarginAlert: margins.isMarginAlert,
        marginStatus: margins.marginStatus,
      },
    })
    return serializeProduct(product)
  } catch (e) {
    if (isPrismaUniqueViolation(e)) {
      throw new AppError({
        statusCode: 409,
        message: 'Ya existe un producto con ese código de barras en este local',
        code: 'BARCODE_DUPLICATE',
      })
    }
    throw e
  }
}

export async function deleteProduct(userId: string, productId: string): Promise<void> {
  const existing = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
      local: { userId, isActive: true },
    },
  })
  if (!existing) {
    throw new AppError({
      statusCode: 404,
      message: 'Producto no encontrado',
      code: 'PRODUCT_NOT_FOUND',
    })
  }
  await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  })
}

export async function bulkUpdateByPercentage(
  userId: string,
  input: {
    localId: string
    categoryId?: string | undefined
    increasePct: number
  },
): Promise<{ updated: number }> {
  const local = await assertLocalOwnership(userId, input.localId)

  const where: Prisma.ProductWhereInput = {
    localId: input.localId,
    isActive: true,
    ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { id: 'asc' },
  })

  if (products.length === 0) {
    return { updated: 0 }
  }

  const pricingInputs = products.map((p: Product) => ({
    id: p.id,
    cost: toNum(p.cost),
    marginPct: toNum(p.marginPct),
  }))

  const results = bulkUpdateCosts(pricingInputs, input.increasePct)
  const minM = Number(local.minMarginPct)

  await prisma.$transaction(
    results.map((r: ProductUpdateResult) => {
      const orig = products.find((x: Product) => x.id === r.id)
      if (!orig) throw new Error('bulk mismatch')
      const m = marginFields(toNum(orig.marginPct), minM)
      return prisma.product.update({
        where: { id: r.id },
        data: {
          cost: r.newCost,
          salePrice: r.salePrice,
          isMarginAlert: m.isMarginAlert,
          marginStatus: m.marginStatus,
        },
      })
    }),
  )

  return { updated: results.length }
}

export async function getProductHistory(
  userId: string,
  productId: string,
  take = 50,
) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      local: { userId, isActive: true },
    },
  })
  if (!product) {
    throw new AppError({
      statusCode: 404,
      message: 'Producto no encontrado',
      code: 'PRODUCT_NOT_FOUND',
    })
  }

  const rows = await prisma.priceHistory.findMany({
    where: { productId },
    orderBy: { recordedAt: 'desc' },
    take,
  })

  return rows.map((h: PriceHistory) => ({
    id: h.id,
    cost: toNum(h.cost),
    marginPct: toNum(h.marginPct),
    salePrice: toNum(h.salePrice),
    changeReason: h.changeReason,
    ipcReference: h.ipcReference === null ? null : toNum(h.ipcReference),
    note: h.note,
    recordedAt: h.recordedAt.toISOString(),
  }))
}
