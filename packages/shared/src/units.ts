export const PRODUCT_UNITS = [
  'unidad',
  'kg',
  'g',
  'lt',
  'ml',
  'pack',
  'docena',
  'caja',
] as const

export type ProductUnit = (typeof PRODUCT_UNITS)[number]

export function isProductUnit(value: string): value is ProductUnit {
  return (PRODUCT_UNITS as readonly string[]).includes(value)
}
