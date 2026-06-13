import { Prisma, type PlanType, type Sale, type SaleLine, type Product } from '@prisma/client'
import type { User } from '@prisma/client'
import { FREE_SALES_HISTORY_DAYS } from 'shared'

import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/AppError.js'
import { validateSoldAt } from '../utils/argentinaTime.js'
import { assertLocalOwnership } from './local.service.js'

function toNum(d: Prisma.Decimal | number): number {
  return typeof d === 'number' ? d : d.toNumber()
}

type SaleLineWithProduct = SaleLine & {
  product: Pick<Product, 'id' | 'name' | 'unit' | 'barcode'>
}

type SaleWithLines = Sale & { lines: SaleLineWithProduct[] }

export function serializeSaleLine(line: SaleLineWithProduct) {
  return {
    id: line.id,
    productId: line.productId,
    productName: line.product.name,
    productUnit: line.product.unit,
    productBarcode: line.product.barcode,
    quantity: toNum(line.quantity),
    unitSalePrice: toNum(line.unitSalePrice),
    unitCostSnapshot: toNum(line.unitCostSnapshot),
    lineRevenue: Math.round(toNum(line.unitSalePrice) * toNum(line.quantity) * 100) / 100,
    lineProfit:
      Math.round(
        (toNum(line.unitSalePrice) - toNum(line.unitCostSnapshot)) * toNum(line.quantity) * 100,
      ) / 100,
  }
}

export function serializeSale(sale: SaleWithLines) {
  const lines = sale.lines.map(serializeSaleLine)
  const totalRevenue = lines.reduce((s, l) => s + l.lineRevenue, 0)
  const totalProfit = lines.reduce((s, l) => s + l.lineProfit, 0)
  const unitsSold = lines.reduce((s, l) => s + l.quantity, 0)

  return {
    id: sale.id,
    localId: sale.localId,
    soldAt: sale.soldAt.toISOString(),
    note: sale.note,
    createdAt: sale.createdAt.toISOString(),
    updatedAt: sale.updatedAt.toISOString(),
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    unitsSold,
    lines,
  }
}

export type CreateSaleItemInput = {
  productId: string
  quantity: number
}

export type CreateSaleInput = {
  localId: string
  soldAt?: Date
  note?: string | null
  items: CreateSaleItemInput[]
}

export async function createSale(userId: string, input: CreateSaleInput) {
  await assertLocalOwnership(userId, input.localId)

  if (!input.items.length) {
    throw new AppError({
      statusCode: 400,
      message: 'La venta debe tener al menos un ítem',
      code: 'VALIDATION_ERROR',
    })
  }

  const soldAt = input.soldAt ?? new Date()
  try {
    validateSoldAt(soldAt)
  } catch (e) {
    throw new AppError({
      statusCode: 400,
      message: e instanceof Error ? e.message : 'soldAt inválido',
      code: 'VALIDATION_ERROR',
    })
  }

  const productIds = [...new Set(input.items.map((i) => i.productId))]
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      localId: input.localId,
      isActive: true,
    },
  })

  if (products.length !== productIds.length) {
    throw new AppError({
      statusCode: 400,
      message: 'Uno o más productos no existen o no pertenecen al local',
      code: 'VALIDATION_ERROR',
    })
  }

  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of input.items) {
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new AppError({
        statusCode: 400,
        message: 'Cada cantidad debe ser un número positivo',
        code: 'VALIDATION_ERROR',
      })
    }
  }

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        localId: input.localId,
        soldAt,
        note:
          input.note === undefined || input.note === null || input.note === ''
            ? null
            : input.note.trim(),
      },
    })

    await tx.saleLine.createMany({
      data: input.items.map((item) => {
        const product = productMap.get(item.productId)!
        return {
          saleId: created.id,
          productId: item.productId,
          quantity: new Prisma.Decimal(item.quantity),
          unitSalePrice: product.salePrice,
          unitCostSnapshot: product.cost,
        }
      }),
    })

    return tx.sale.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        lines: {
          include: {
            product: {
              select: { id: true, name: true, unit: true, barcode: true },
            },
          },
        },
      },
    })
  })

  return serializeSale(sale)
}

export type ListSalesQuery = {
  localId: string
  from?: Date
  to?: Date
  page?: number
  limit?: number
}

export function clampListRangeForPlan(
  plan: PlanType,
  from?: Date,
  to?: Date,
): { from?: Date; to?: Date } {
  if (plan !== 'FREE') {
    return {
      ...(from !== undefined ? { from } : {}),
      ...(to !== undefined ? { to } : {}),
    }
  }
  const minFrom = new Date(Date.now() - FREE_SALES_HISTORY_DAYS * 24 * 60 * 60 * 1000)
  const clampedFrom = !from || from < minFrom ? minFrom : from
  return {
    from: clampedFrom,
    ...(to !== undefined ? { to } : {}),
  }
}

export async function listSales(userId: string, userPlan: PlanType, query: ListSalesQuery) {
  await assertLocalOwnership(userId, query.localId)

  const page = query.page ?? 1
  const limit = Math.min(query.limit ?? 20, 100)
  const skip = (page - 1) * limit

  const { from, to } = clampListRangeForPlan(userPlan, query.from, query.to)

  const where: Prisma.SaleWhereInput = {
    localId: query.localId,
    ...(from || to
      ? {
          soldAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  }

  const [total, rows] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      orderBy: { soldAt: 'desc' },
      skip,
      take: limit,
      include: {
        lines: {
          include: {
            product: {
              select: { id: true, name: true, unit: true, barcode: true },
            },
          },
        },
      },
    }),
  ])

  return {
    items: rows.map(serializeSale),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  }
}

export async function getSaleById(userId: string, userPlan: PlanType, saleId: string) {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      local: { select: { userId: true } },
      lines: {
        include: {
          product: {
            select: { id: true, name: true, unit: true, barcode: true },
          },
        },
      },
    },
  })

  if (!sale || sale.local.userId !== userId) {
    throw new AppError({
      statusCode: 404,
      message: 'Venta no encontrada',
      code: 'NOT_FOUND',
    })
  }

  if (userPlan === 'FREE') {
    const minFrom = new Date(Date.now() - FREE_SALES_HISTORY_DAYS * 24 * 60 * 60 * 1000)
    if (sale.soldAt < minFrom) {
      throw new AppError({
        statusCode: 403,
        message: 'Tu plan solo permite ver ventas de los últimos 7 días',
        code: 'PLAN_REQUIRED',
      })
    }
  }

  const { local: _local, ...rest } = sale
  return serializeSale(rest)
}

/** Líneas de venta en un rango (para analytics). */
export async function fetchSaleLinesInRange(
  localId: string,
  from: Date,
  to: Date,
) {
  return prisma.saleLine.findMany({
    where: {
      sale: {
        localId,
        soldAt: { gte: from, lte: to },
      },
    },
    include: {
      sale: { select: { id: true, soldAt: true } },
      product: {
        select: {
          id: true,
          name: true,
          categoryId: true,
          category: { select: { id: true, name: true, colorHex: true } },
        },
      },
    },
  })
}

export async function assertSalesLocalAccess(userId: string, localId: string): Promise<void> {
  await assertLocalOwnership(userId, localId)
}
