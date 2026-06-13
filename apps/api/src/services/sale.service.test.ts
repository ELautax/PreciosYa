import { Prisma, type Product } from '@prisma/client'

const { prismaMock, assertLocalOwnershipMock } = vi.hoisted(() => ({
  prismaMock: {
    product: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  assertLocalOwnershipMock: vi.fn(),
}))

vi.mock('../lib/prisma.js', () => ({
  prisma: prismaMock,
}))

vi.mock('./local.service.js', () => ({
  assertLocalOwnership: assertLocalOwnershipMock,
}))

import { createSale } from './sale.service.js'

function makeProduct(overrides?: Partial<Product>): Product {
  return {
    id: 'p-1',
    localId: 'l-1',
    categoryId: null,
    name: 'Coca Cola',
    barcode: '779',
    unit: 'unidad',
    cost: new Prisma.Decimal(800),
    marginPct: new Prisma.Decimal(25),
    salePrice: new Prisma.Decimal(1000),
    isMarginAlert: false,
    marginStatus: 'OK',
    notes: null,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('sale.service createSale', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    assertLocalOwnershipMock.mockResolvedValue({ id: 'l-1' })
    prismaMock.product.findMany.mockResolvedValue([makeProduct()])
  })

  it('persiste snapshots de costo y precio del producto', async () => {
    const soldAt = new Date('2026-06-01T15:00:00.000Z')
    const saleId = 'sale-1'

    prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const txObj = {
        sale: {
          create: vi.fn().mockResolvedValue({ id: saleId, localId: 'l-1', soldAt, note: null }),
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            id: saleId,
            localId: 'l-1',
            soldAt,
            note: null,
            createdAt: soldAt,
            updatedAt: soldAt,
            lines: [
              {
                id: 'line-1',
                saleId,
                productId: 'p-1',
                quantity: new Prisma.Decimal(3),
                unitSalePrice: new Prisma.Decimal(1000),
                unitCostSnapshot: new Prisma.Decimal(800),
                createdAt: soldAt,
                product: {
                  id: 'p-1',
                  name: 'Coca Cola',
                  unit: 'unidad',
                  barcode: '779',
                },
              },
            ],
          }),
        },
        saleLine: {
          createMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      }
      return fn(txObj)
    })

    const result = await createSale('u-1', {
      localId: 'l-1',
      soldAt,
      items: [{ productId: 'p-1', quantity: 3 }],
    })

    expect(result.lines[0]?.unitCostSnapshot).toBe(800)
    expect(result.lines[0]?.unitSalePrice).toBe(1000)
    expect(result.lines[0]?.lineProfit).toBe(600)
    expect(result.totalRevenue).toBe(3000)
  })
})
