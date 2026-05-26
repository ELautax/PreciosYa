import { isProductUnit, type ProductUnit } from 'shared'

import { prisma } from '../lib/prisma.js'
import { assertLocalOwnership } from './local.service.js'

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product'

type BarcodeLookupSource =
  | 'local'
  | 'user_catalog'
  | 'shared_catalog'
  | 'openfoodfacts'
  | null

export type BarcodeLookupResult = {
  barcode: string
  source: BarcodeLookupSource
  name: string | null
  unit: ProductUnit | null
  cost: number | null
  marginPct: number | null
  categoryId: string | null
  notes: string | null
  existingProductId: string | null
  brand: string | null
}

type CatalogProductRow = {
  id: string
  localId: string
  name: string
  barcode: string | null
  unit: string
  cost: number
  marginPct: number
  notes: string | null
  categoryId: string | null
  category: { templateId: string | null } | null
}

function parseUnitFromQuantity(quantity: string | undefined): ProductUnit | null {
  if (!quantity) return null
  const q = quantity.toLowerCase()
  if (/\bkg\b|kilogramo/.test(q)) return 'kg'
  if (/\bg\b|\bgr\b|gramo/.test(q) && !/\bkg\b/.test(q)) return 'g'
  if (/\bl\b|\blt\b|litro/.test(q) && !/\bml\b/.test(q)) return 'lt'
  if (/\bml\b|mililitro/.test(q)) return 'ml'
  if (/docena/.test(q)) return 'docena'
  if (/caja|box/.test(q)) return 'caja'
  if (/pack|paquete|x\s*\d+/i.test(q)) return 'pack'
  return null
}

async function fetchFromOpenFoodFacts(barcode: string): Promise<{
  name: string | null
  unit: ProductUnit | null
  brand: string | null
  notes: string | null
}> {
  const url = `${OFF_BASE}/${encodeURIComponent(barcode)}.json`
  let res: Response
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(12_000),
      headers: { 'User-Agent': 'PreciosYa/1.0 (barcode-lookup)' },
    })
  } catch {
    return { name: null, unit: null, brand: null, notes: null }
  }

  if (!res.ok) return { name: null, unit: null, brand: null, notes: null }

  const json = (await res.json()) as {
    status?: number
    product?: {
      product_name?: string
      product_name_es?: string
      brands?: string
      quantity?: string
      categories?: string
    }
  }

  if (json.status !== 1 || !json.product) {
    return { name: null, unit: null, brand: null, notes: null }
  }

  const p = json.product
  const name =
    p.product_name_es?.trim() ||
    p.product_name?.trim() ||
    null
  const brand = p.brands?.split(',')[0]?.trim() || null
  const unit = parseUnitFromQuantity(p.quantity)
  const notesParts = [brand, p.quantity, p.categories].filter(Boolean)
  const notes = notesParts.length > 0 ? notesParts.join(' · ').slice(0, 500) : null

  return { name, unit, brand, notes }
}

function emptyLookup(barcode: string): BarcodeLookupResult {
  return {
    barcode,
    source: null,
    name: null,
    unit: null,
    cost: null,
    marginPct: null,
    categoryId: null,
    notes: null,
    existingProductId: null,
    brand: null,
  }
}

async function mapTemplateCategoryToLocal(
  localId: string,
  templateId: string | null,
): Promise<string | null> {
  if (!templateId) return null
  const category = await prisma.category.findFirst({
    where: { localId, templateId, isActive: true },
    select: { id: true },
  })
  return category?.id ?? null
}

async function buildCatalogLookup(
  source: Extract<BarcodeLookupSource, 'local' | 'user_catalog' | 'shared_catalog'>,
  localId: string,
  row: CatalogProductRow,
): Promise<BarcodeLookupResult> {
  const mappedCategoryId =
    source === 'local'
      ? row.categoryId
      : await mapTemplateCategoryToLocal(localId, row.category?.templateId ?? null)

  return {
    barcode: row.barcode ?? '',
    source,
    name: row.name,
    unit: isProductUnit(row.unit) ? row.unit : null,
    cost: row.cost,
    marginPct: row.marginPct,
    categoryId: mappedCategoryId,
    notes: row.notes,
    existingProductId: source === 'local' ? row.id : null,
    brand: null,
  }
}

async function findCatalogProduct(
  userId: string,
  localId: string,
  barcode: string,
): Promise<BarcodeLookupResult | null> {
  const localMatch = await prisma.product.findFirst({
    where: { localId, barcode, isActive: true },
    select: {
      id: true,
      localId: true,
      name: true,
      barcode: true,
      unit: true,
      cost: true,
      marginPct: true,
      notes: true,
      categoryId: true,
      category: { select: { templateId: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  if (localMatch) {
    return buildCatalogLookup('local', localId, {
      ...localMatch,
      cost: Number(localMatch.cost),
      marginPct: Number(localMatch.marginPct),
    })
  }

  const userCatalogMatch = await prisma.product.findFirst({
    where: {
      barcode,
      isActive: true,
      localId: { not: localId },
      local: { userId, isActive: true },
    },
    select: {
      id: true,
      localId: true,
      name: true,
      barcode: true,
      unit: true,
      cost: true,
      marginPct: true,
      notes: true,
      categoryId: true,
      category: { select: { templateId: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  if (userCatalogMatch) {
    return buildCatalogLookup('user_catalog', localId, {
      ...userCatalogMatch,
      cost: Number(userCatalogMatch.cost),
      marginPct: Number(userCatalogMatch.marginPct),
    })
  }

  const sharedCatalogMatch = await prisma.product.findFirst({
    where: {
      barcode,
      isActive: true,
      local: { isActive: true, userId: { not: userId } },
    },
    select: {
      id: true,
      localId: true,
      name: true,
      barcode: true,
      unit: true,
      cost: true,
      marginPct: true,
      notes: true,
      categoryId: true,
      category: { select: { templateId: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  if (sharedCatalogMatch) {
    return buildCatalogLookup('shared_catalog', localId, {
      ...sharedCatalogMatch,
      cost: Number(sharedCatalogMatch.cost),
      marginPct: Number(sharedCatalogMatch.marginPct),
    })
  }

  return null
}

export async function lookupBarcodeForLocal(
  userId: string,
  localId: string,
  barcode: string,
): Promise<BarcodeLookupResult> {
  await assertLocalOwnership(userId, localId)
  const code = barcode.trim()
  if (!code) {
    return emptyLookup(code)
  }

  const catalogMatch = await findCatalogProduct(userId, localId, code)
  if (catalogMatch) {
    return catalogMatch
  }

  const off = await fetchFromOpenFoodFacts(code)
  if (off.name) {
    return {
      barcode: code,
      source: 'openfoodfacts',
      name: off.name,
      unit: off.unit,
      cost: null,
      marginPct: null,
      categoryId: null,
      notes: off.notes,
      existingProductId: null,
      brand: off.brand,
    }
  }

  return emptyLookup(code)
}
