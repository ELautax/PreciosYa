import type { User } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/AppError.js'

import { createProduct } from './product.service.js'

export type ImportCsvLineError = { line: number; message: string }

/** Parse CSV line with optional double-quoted cells (commas allowed inside quotes). */
export function splitCsvRow(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    const next = line[i + 1]
    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (c === ',' && !inQuotes) {
      cells.push(cur.trim())
      cur = ''
    } else {
      cur += c
    }
  }
  cells.push(cur.trim())
  return cells
}

function normalizeHeaderToken(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

/** Accepts decimals with `.` or a single trailing `,ddd` Argentine-style. */
function parsePositiveMoney(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (/^-?\d+,\d+$/.test(trimmed)) {
    return Number(trimmed.replace(',', '.'))
  }
  const n = Number(trimmed.replace(/,/g, ''))
  return Number.isFinite(n) ? n : Number.NaN
}

function parseNonNegative(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (/^-?\d+,\d+$/.test(trimmed)) {
    return Number(trimmed.replace(',', '.'))
  }
  const n = Number(trimmed.replace(/,/g, ''))
  return Number.isFinite(n) ? n : Number.NaN
}

export type ParsedCsvProductRow = {
  name: string
  cost: number
  marginPct: number
  unit?: string | undefined
  barcode?: string | null | undefined
  categoryId?: string | null | undefined
}

type HeaderKey = 'name' | 'cost' | 'marginPct' | 'unit' | 'barcode' | 'category'

const HEADER_SYNONYMS: Record<string, HeaderKey | undefined> = {
  nombre: 'name',
  name: 'name',
  producto: 'name',
  costo: 'cost',
  cost: 'cost',
  precio_costo: 'cost',
  precio_compra: 'cost',
  margen: 'marginPct',
  margen_pct: 'marginPct',
  margenpct: 'marginPct',
  margin: 'marginPct',
  margin_pct: 'marginPct',
  marginpct: 'marginPct',
  unidad: 'unit',
  unit: 'unit',
  codigo_barras: 'barcode',
  codigo_de_barras: 'barcode',
  barcode: 'barcode',
  ean: 'barcode',
  categoria: 'category',
  category: 'category',
}

function resolveHeader(headers: string[]): Map<number, HeaderKey> | null {
  const map = new Map<number, HeaderKey>()
  headers.forEach((h, idx) => {
    const nk = HEADER_SYNONYMS[normalizeHeaderToken(h)] ?? undefined
    if (nk !== undefined) {
      map.set(idx, nk)
    }
  })
  const v = [...map.values()]
  if (v.includes('name') && v.includes('cost') && v.includes('marginPct')) {
    return map
  }
  return null
}

function rowIntoObject(
  cells: string[],
  colMap: Map<number, HeaderKey> | null,
  lineNum: number,
  categoryByNormalizedName: Map<string, string>,
): { ok: ParsedCsvProductRow } | { line: number; message: string } {
  if (!colMap || colMap.size === 0) {
    if (cells.length < 3) {
      return {
        line: lineNum,
        message:
          'La fila debe tener al menos nombre, costo y margen (%), separados por coma.',
      }
    }
  }

  let nameRaw: string | undefined
  let costRaw: string | undefined
  let marginRaw: string | undefined
  let unitRaw: string | undefined
  let barcodeRaw: string | undefined
  let categoryRaw: string | undefined

  if (colMap && colMap.size > 0) {
    cells.forEach((cell, idx) => {
      const hk = colMap.get(idx)
      if (!hk) return
      if (hk === 'name') nameRaw = cell
      else if (hk === 'cost') costRaw = cell
      else if (hk === 'marginPct') marginRaw = cell
      else if (hk === 'unit') unitRaw = cell
      else if (hk === 'barcode') barcodeRaw = cell
      else if (hk === 'category') categoryRaw = cell
    })
  } else {
    ;[nameRaw, costRaw, marginRaw, unitRaw, barcodeRaw, categoryRaw] = [
      cells[0],
      cells[1],
      cells[2],
      cells[3],
      cells[4],
      cells[5],
    ]
  }

  const name = (nameRaw ?? '').trim()
  if (!name) {
    return { line: lineNum, message: 'Falta el nombre del producto.' }
  }

  const cost = parsePositiveMoney(costRaw ?? '')
  if (costRaw === undefined || costRaw.trim() === '' || cost === null || Number.isNaN(cost) || cost <= 0) {
    return { line: lineNum, message: 'El costo debe ser un número mayor que cero.' }
  }

  const marginPct = parseNonNegative(marginRaw ?? '')
  if (
    marginRaw === undefined ||
    marginRaw.trim() === '' ||
    marginPct === null ||
    Number.isNaN(marginPct) ||
    marginPct < 0
  ) {
    return { line: lineNum, message: 'El margen (%) debe ser un número igual o mayor que cero.' }
  }

  let categoryId: string | null | undefined
  const catTrim = categoryRaw?.trim()
  if (catTrim !== undefined && catTrim !== '') {
    const nid = normalizeHeaderToken(catTrim)
    const cid = categoryByNormalizedName.get(nid)
    if (!cid) {
      return {
        line: lineNum,
        message: `No hay una categoría llamada "${catTrim}" en este local.`,
      }
    }
    categoryId = cid
  }

  const unit = unitRaw?.trim() || undefined
  const barcode =
    barcodeRaw === undefined || barcodeRaw.trim() === '' ? undefined : barcodeRaw.trim()

  return {
    ok: {
      name,
      cost,
      marginPct,
      ...(unit ? { unit } : {}),
      ...(barcode !== undefined ? { barcode } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
    },
  }
}

function lineErrorMessage(e: unknown): string {
  if (e instanceof AppError) {
    if (e.code === 'BARCODE_DUPLICATE') return e.message
    if (e.code === 'PRODUCT_LIMIT_REACHED') return e.message
    if (e.code === 'INVALID_CATEGORY') return e.message
    if (e.code === 'INVALID_PRICING') return e.message
    return e.message
  }
  return 'No se pudo crear la fila. Revisá los datos.'
}

/** Importa varias líneas desde CSV texto plano UTF-8. Errores reportan número de línea (1-based) del archivo enviado. */
export async function importProductsFromCsv(
  user: User,
  localId: string,
  csvText: string,
): Promise<{ imported: number; errors: ImportCsvLineError[] }> {
  const trimmedLines = csvText.replace(/\uFEFF/, '').split(/\r?\n/).map((ln) => ln.trimEnd())

  const firstNonEmpty = trimmedLines.findIndex((ln) => ln.trim() !== '')
  let startIdx = 0
  let colMap: Map<number, HeaderKey> | null = null
  if (firstNonEmpty >= 0) {
    const headerCells = splitCsvRow(trimmedLines[firstNonEmpty]!)
    colMap = resolveHeader(headerCells)
    if (colMap !== null) {
      startIdx = firstNonEmpty + 1
    }
  }

  const cats = await prisma.category.findMany({
    where: { localId },
    select: { id: true, name: true },
  })
  const categoryByNormalizedName = new Map<string, string>()
  for (const c of cats) {
    categoryByNormalizedName.set(normalizeHeaderToken(c.name), c.id)
  }

  let imported = 0
  const errors: ImportCsvLineError[] = []

  for (let i = startIdx; i < trimmedLines.length; i++) {
    const physicalLineNum = i + 1
    const line = trimmedLines[i]!
    if (line.trim() === '') continue

    const cells = splitCsvRow(line)
    const parsed = rowIntoObject(cells, colMap, physicalLineNum, categoryByNormalizedName)
    if (!('ok' in parsed)) {
      errors.push(parsed)
      continue
    }

    try {
      await createProduct(user, {
        localId,
        ...parsed.ok,
      })
      imported++
    } catch (e) {
      errors.push({
        line: physicalLineNum,
        message: lineErrorMessage(e),
      })
    }
  }

  return { imported, errors }
}
