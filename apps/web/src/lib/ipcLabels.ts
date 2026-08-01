/** Etiquetas legibles para IndexType IPC (alineado con divisiones COICOP / Alphacast). */
export const IPC_INDEX_LABELS: Record<string, string> = {
  IPC_INDEC: 'Nivel general',
  IPC_INDEC_ALIMENTOS: 'Alimentos y bebidas',
  IPC_INDEC_BEBIDAS: 'Bebidas y tabaco',
  IPC_INDEC_VESTIMENTA: 'Prendas y calzado',
  IPC_INDEC_VIVIENDA: 'Vivienda y servicios',
  IPC_INDEC_HOGAR: 'Equipamiento del hogar',
  IPC_INDEC_SALUD: 'Salud',
  IPC_INDEC_TRANSPORTE: 'Transporte',
  IPC_INDEC_COMUNICACION: 'Comunicación',
  IPC_INDEC_RECREACION: 'Recreación y cultura',
  IPC_INDEC_EDUCACION: 'Educación',
  IPC_INDEC_RESTAURANTES: 'Restaurantes y hoteles',
  IPC_INDEC_VARIOS: 'Bienes y servicios varios',
}

export const IPC_INDEX_TYPES = Object.keys(IPC_INDEX_LABELS)

/** Slug de categoryUi / plantillas COICOP por IndexType. */
export const IPC_INDEX_CATEGORY_SLUG: Record<string, string | null> = {
  IPC_INDEC: null,
  IPC_INDEC_ALIMENTOS: 'alimentos',
  IPC_INDEC_BEBIDAS: 'bebidas-tabaco',
  IPC_INDEC_VESTIMENTA: 'vestimenta',
  IPC_INDEC_VIVIENDA: 'vivienda',
  IPC_INDEC_HOGAR: 'hogar',
  IPC_INDEC_SALUD: 'salud',
  IPC_INDEC_TRANSPORTE: 'transporte',
  IPC_INDEC_COMUNICACION: 'comunicacion',
  IPC_INDEC_RECREACION: 'recreacion',
  IPC_INDEC_EDUCACION: 'educacion',
  IPC_INDEC_RESTAURANTES: 'restaurantes',
  IPC_INDEC_VARIOS: 'varios',
}

export const BCRA_INDEX_LABELS: Record<string, string> = {
  BCRA_USD_OFICIAL: 'Dólar oficial BCRA',
  BCRA_USD_MEP: 'Dólar MEP (referencia)',
}
