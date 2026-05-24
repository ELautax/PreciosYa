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
