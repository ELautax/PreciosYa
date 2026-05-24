import { IndexType } from '@prisma/client'

/** Columnas `… - current_prices_mom` del dataset Alphacast 5515 (INDEC agrupado). */
export const ALPHACAST_MOM_COLUMN_BY_INDEX: { indexType: IndexType; columnBase: string }[] = [
  { indexType: IndexType.IPC_INDEC, columnBase: 'Nivel general' },
  {
    indexType: IndexType.IPC_INDEC_ALIMENTOS,
    columnBase: 'Alimentos y bebidas no alcohólicas',
  },
  { indexType: IndexType.IPC_INDEC_BEBIDAS, columnBase: 'Bebidas alcohólicas y tabaco' },
  { indexType: IndexType.IPC_INDEC_VESTIMENTA, columnBase: 'Prendas de vestir y calzado' },
  {
    indexType: IndexType.IPC_INDEC_VIVIENDA,
    columnBase: 'Vivienda, agua, electricidad y otros combustibles',
  },
  {
    indexType: IndexType.IPC_INDEC_HOGAR,
    columnBase: 'Equipamiento y mantenimiento del hogar',
  },
  { indexType: IndexType.IPC_INDEC_SALUD, columnBase: 'Salud' },
  { indexType: IndexType.IPC_INDEC_TRANSPORTE, columnBase: 'Transporte' },
  { indexType: IndexType.IPC_INDEC_COMUNICACION, columnBase: 'Comunicación' },
  { indexType: IndexType.IPC_INDEC_RECREACION, columnBase: 'Recreación y cultura' },
  { indexType: IndexType.IPC_INDEC_EDUCACION, columnBase: 'Educación' },
  { indexType: IndexType.IPC_INDEC_RESTAURANTES, columnBase: 'Restaurantes y hoteles' },
  { indexType: IndexType.IPC_INDEC_VARIOS, columnBase: 'Bienes y servicios varios' },
]

export const ALPHACAST_MOM_SUFFIX = ' - current_prices_mom'
