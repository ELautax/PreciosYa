import { isProductUnit, type ProductUnit } from 'shared'

import { prisma } from '../lib/prisma.js'
import { assertLocalOwnership } from './local.service.js'
import { serializeProduct } from './product.service.js'

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product'

export type BarcodeLookupResult = {
  barcode: string
  source: 'local' | 'openfoodfacts' | null
  name: string | null
  unit: ProductUnit | null
  cost: number | null
  marginPct: number | null
  categoryId: string | null
  notes: string | null
  existingProductId: string | null
  brand: string | null
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

export async function lookupBarcodeForLocal(
  userId: string,
  localId: string,
  barcode: string,
): Promise<BarcodeLookupResult> {
  await assertLocalOwnership(userId, localId)
  const code = barcode.trim()
  if (!code) {
    return {
      barcode: code,
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

  const existing = await prisma.product.findFirst({
    where: { localId, barcode: code, isActive: true },
  })

  if (existing) {
    const serialized = serializeProduct(existing)
    return {
      barcode: code,
      source: 'local',
      name: serialized.name,
      unit: isProductUnit(serialized.unit) ? serialized.unit : null,
      cost: serialized.cost,
      marginPct: serialized.marginPct,
      categoryId: serialized.categoryId,
      notes: serialized.notes,
      existingProductId: serialized.id,
      brand: null,
    }
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

  return {
    barcode: code,
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
