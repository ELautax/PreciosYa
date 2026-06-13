import type { RequestHandler } from 'express'
import request from 'supertest'

const {
  getProductsMock,
  createProductMock,
  updateProductMock,
  deleteProductMock,
  bulkUpdateByPercentageMock,
  applyIPCToLocalMock,
  uploadPriceListPngMock,
  importProductsFromCsvMock,
} = vi.hoisted(() => ({
  getProductsMock: vi.fn(),
  createProductMock: vi.fn(),
  updateProductMock: vi.fn(),
  deleteProductMock: vi.fn(),
  bulkUpdateByPercentageMock: vi.fn(),
  applyIPCToLocalMock: vi.fn(),
  uploadPriceListPngMock: vi.fn(),
  importProductsFromCsvMock: vi.fn(),
}))

const fakeUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'admin@test.com',
  name: 'Admin',
  avatarUrl: null,
  googleId: null,
  plan: 'PRO' as const,
  planExpiresAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

vi.mock('../middlewares/auth.middleware.js', () => ({
  authMiddleware: ((req, _res, next) => {
    req.user = fakeUser
    next()
  }) as RequestHandler,
}))

vi.mock('../services/product.service.js', () => ({
  getProducts: getProductsMock,
  createProduct: createProductMock,
  updateProduct: updateProductMock,
  deleteProduct: deleteProductMock,
  bulkUpdateByPercentage: bulkUpdateByPercentageMock,
  getProductById: vi.fn(),
  getProductHistory: vi.fn(),
}))

vi.mock('../services/economic-index.service.js', () => ({
  applyIPCToLocal: applyIPCToLocalMock,
  fetchPersistAndReturnLatestIpc: vi.fn(),
  getIpcHistory: vi.fn(),
  getLatestIndicesSnapshot: vi.fn(),
  serializeEconomicIndex: vi.fn(),
}))

vi.mock('../services/productCsvImport.service.js', () => ({
  importProductsFromCsv: importProductsFromCsvMock,
}))

vi.mock('../services/export.service.js', () => ({
  uploadPriceListPng: uploadPriceListPngMock,
  getLatestPriceListForUser: vi.fn(),
}))

const { createSaleMock, listSalesMock, getSalesDashboardMock } = vi.hoisted(() => ({
  createSaleMock: vi.fn(),
  listSalesMock: vi.fn(),
  getSalesDashboardMock: vi.fn(),
}))

vi.mock('../services/sale.service.js', () => ({
  createSale: createSaleMock,
  listSales: listSalesMock,
  getSaleById: vi.fn(),
  assertSalesLocalAccess: vi.fn(),
  fetchSaleLinesInRange: vi.fn(),
}))

vi.mock('../services/sale-analytics.service.js', () => ({
  getSalesDashboard: getSalesDashboardMock,
  getTopProducts: vi.fn(),
  getStagnantProducts: vi.fn(),
  getPromoteProducts: vi.fn(),
  getStarProducts: vi.fn(),
  getCategoryPerformance: vi.fn(),
  assertPeriodAllowed: vi.fn(),
}))

import { app } from '../app.js'

const UUID_1 = '11111111-1111-4111-8111-111111111111'
const UUID_2 = '22222222-2222-4222-8222-222222222222'

describe('API integration contracts', () => {
  it('products CRUD and bulk update endpoints responden con envelope success', async () => {
    getProductsMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    })
    createProductMock.mockResolvedValue({
      id: UUID_2,
      localId: UUID_1,
      categoryId: null,
      name: 'Leche',
      barcode: null,
      unit: 'unidad',
      cost: 100,
      marginPct: 20,
      salePrice: 120,
      isMarginAlert: false,
      notes: null,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    updateProductMock.mockResolvedValue({
      id: UUID_2,
      localId: UUID_1,
      categoryId: null,
      name: 'Leche Entera',
      barcode: null,
      unit: 'unidad',
      cost: 110,
      marginPct: 20,
      salePrice: 130,
      isMarginAlert: false,
      notes: null,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    })
    bulkUpdateByPercentageMock.mockResolvedValue({ updated: 3 })
    deleteProductMock.mockResolvedValue(undefined)

    const listRes = await request(app).get('/api/products').query({ localId: UUID_1 })
    expect(listRes.status).toBe(200)
    expect(listRes.body.success).toBe(true)

    const createRes = await request(app).post('/api/products').send({
      localId: UUID_1,
      name: 'Leche',
      cost: 100,
      marginPct: 20,
    })
    expect(createRes.status).toBe(201)
    expect(createRes.body.success).toBe(true)

    const updateRes = await request(app).put(`/api/products/${UUID_2}`).send({
      name: 'Leche Entera',
      cost: 110,
    })
    expect(updateRes.status).toBe(200)
    expect(updateRes.body.success).toBe(true)

    const bulkRes = await request(app).put('/api/products/bulk-update').send({
      localId: UUID_1,
      increasePct: 8,
    })
    expect(bulkRes.status).toBe(200)
    expect(bulkRes.body).toMatchObject({
      success: true,
      data: { updated: 3 },
    })

    const deleteRes = await request(app).delete(`/api/products/${UUID_2}`)
    expect(deleteRes.status).toBe(200)
    expect(deleteRes.body).toMatchObject({
      success: true,
      data: { ok: true },
    })
  })

  it('products import-csv devuelve resumen importados y errores por línea', async () => {
    importProductsFromCsvMock.mockResolvedValue({
      imported: 2,
      errors: [{ line: 4, message: 'Datos incompletos' }],
    })

    const res = await request(app)
      .post('/api/products/import-csv')
      .send({
        localId: UUID_1,
        csv: 'nombre,costo,margen\nA,10,15\n',
      })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: {
        imported: 2,
        errors: [{ line: 4, message: 'Datos incompletos' }],
      },
    })
    expect(importProductsFromCsvMock).toHaveBeenCalled()
  })

  it('apply-ipc endpoint aplica IPC y devuelve resumen', async () => {
    applyIPCToLocalMock.mockResolvedValue({
      updated: 12,
      appliedIpcPct: 4.5,
    })

    const res = await request(app).put(`/api/locals/${UUID_1}/apply-ipc`).send({})
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: {
        updated: 12,
        appliedIpcPct: 4.5,
      },
    })
  })

  it('export price-list endpoint acepta multipart PNG', async () => {
    uploadPriceListPngMock.mockResolvedValue({
      id: UUID_2,
      localId: UUID_1,
      format: 'PNG',
      fileUrl: 'https://example.com/file.png',
      sharedVia: 'web',
      createdAt: '2026-01-03T00:00:00.000Z',
    })

    const pngBytes = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000000020001e221bc330000000049454e44ae426082',
      'hex',
    )

    const res = await request(app)
      .post('/api/exports/price-list')
      .field('localId', UUID_1)
      .field('sharedVia', 'web')
      .attach('file', pngBytes, {
        filename: 'list.png',
        contentType: 'image/png',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(uploadPriceListPngMock).toHaveBeenCalled()
  })

  it('sales endpoints responden con envelope success', async () => {
    createSaleMock.mockResolvedValue({
      id: UUID_2,
      localId: UUID_1,
      soldAt: '2026-06-01T12:00:00.000Z',
      note: null,
      totalRevenue: 3000,
      totalProfit: 600,
      unitsSold: 3,
      lines: [],
    })
    listSalesMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    })
    getSalesDashboardMock.mockResolvedValue({
      salesToday: 125400,
      salesMonth: 2450000,
      profitMonth: 820000,
      unitsSold: 1240,
      averageTicket: 4500,
    })

    const createRes = await request(app).post('/api/sales').send({
      localId: UUID_1,
      items: [{ productId: UUID_2, quantity: 3 }],
    })
    expect(createRes.status).toBe(201)
    expect(createRes.body.success).toBe(true)

    const listRes = await request(app).get('/api/sales').query({ localId: UUID_1 })
    expect(listRes.status).toBe(200)
    expect(listRes.body.success).toBe(true)

    const dashRes = await request(app)
      .get('/api/sales/dashboard')
      .query({ localId: UUID_1, period: '7d' })
    expect(dashRes.status).toBe(200)
    expect(dashRes.body.success).toBe(true)
  })
})
