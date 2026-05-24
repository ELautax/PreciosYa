import { Prisma, type Local, type Product, type User } from '@prisma/client'

import { AppError } from '../utils/AppError.js'

const { prismaMock, assertLocalOwnershipMock } = vi.hoisted(() => ({
  prismaMock: {
    product: {
      count: vi.fn(),
      create: vi.fn(),
    },
    category: {
      findFirst: vi.fn(),
    },
  },
  assertLocalOwnershipMock: vi.fn(),
}))

vi.mock('../lib/prisma.js', () => ({
  prisma: prismaMock,
}))

vi.mock('./local.service.js', () => ({
  assertLocalOwnership: assertLocalOwnershipMock,
}))

import { createProduct } from './product.service.js'

function makeUser(plan: User['plan']): User {
  return {
    id: 'u-1',
    email: 'user@test.com',
    name: 'User',
    avatarUrl: null,
    googleId: null,
    plan,
    planExpiresAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }
}

function makeLocal(minMarginPct: number): Local {
  return {
    id: 'l-1',
    userId: 'u-1',
    name: 'Kiosco',
    address: null,
    minMarginPct: new Prisma.Decimal(minMarginPct),
    currency: 'ARS',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }
}

function makeProduct(): Product {
  return {
    id: 'p-1',
    localId: 'l-1',
    categoryId: null,
    name: 'Leche',
    barcode: '123',
    unit: 'unidad',
    cost: new Prisma.Decimal(100),
    marginPct: new Prisma.Decimal(20),
    salePrice: new Prisma.Decimal(120),
    isMarginAlert: false,
    marginStatus: 'OK',
    notes: null,
    isActive: true,
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  }
}

describe('product.service createProduct', () => {
  it('bloquea creación cuando alcanza límite FREE', async () => {
    prismaMock.product.count.mockResolvedValue(30)
    const user = makeUser('FREE')

    await expect(
      createProduct(user, {
        localId: 'l-1',
        name: 'Leche',
        cost: 100,
        marginPct: 20,
      }),
    ).rejects.toMatchObject({
      code: 'PRODUCT_LIMIT_REACHED',
      statusCode: 403,
    } satisfies Partial<AppError>)
  })

  it('crea producto, calcula precio y normaliza campos', async () => {
    prismaMock.product.count.mockResolvedValue(0)
    assertLocalOwnershipMock.mockResolvedValue(makeLocal(20))
    prismaMock.product.create.mockResolvedValue(makeProduct())

    const user = makeUser('PRO')
    const result = await createProduct(user, {
      localId: 'l-1',
      name: '  Leche  ',
      cost: 100,
      marginPct: 20,
      barcode: ' 123 ',
      unit: ' ',
      notes: '',
    })

    expect(prismaMock.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Leche',
          barcode: '123',
          unit: 'unidad',
          salePrice: 120,
          isMarginAlert: false,
          marginStatus: 'WARNING',
          notes: null,
        }),
      }),
    )
    expect(result.salePrice).toBe(120)
    expect(result.name).toBe('Leche')
  })
})
