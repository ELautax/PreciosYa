import { IndexType } from '@prisma/client'

export type IpcSeriesConfig = {
  indexType: IndexType
  seriesId: string
  label: string
}

/** Series mensuales IPC por división COICOP (datos.gob.ar). Ver docs/IPC_SOURCES.md */
export const IPC_SERIES_CONFIG: IpcSeriesConfig[] = [
  { indexType: IndexType.IPC_INDEC, seriesId: '148.3_INIVELNAL_DICI_M_26', label: 'IPC general' },
  {
    indexType: IndexType.IPC_INDEC_ALIMENTOS,
    seriesId: '148.3_INIVELNAL_DICI_M_34',
    label: 'Alimentos y bebidas',
  },
  {
    indexType: IndexType.IPC_INDEC_BEBIDAS,
    seriesId: '148.3_INIVELNAL_DICI_M_35',
    label: 'Bebidas alcohólicas y tabaco',
  },
  {
    indexType: IndexType.IPC_INDEC_VESTIMENTA,
    seriesId: '148.3_INIVELNAL_DICI_M_36',
    label: 'Prendas y calzado',
  },
  {
    indexType: IndexType.IPC_INDEC_VIVIENDA,
    seriesId: '148.3_INIVELNAL_DICI_M_37',
    label: 'Vivienda',
  },
  {
    indexType: IndexType.IPC_INDEC_HOGAR,
    seriesId: '148.3_INIVELNAL_DICI_M_38',
    label: 'Hogar',
  },
  { indexType: IndexType.IPC_INDEC_SALUD, seriesId: '148.3_INIVELNAL_DICI_M_39', label: 'Salud' },
  {
    indexType: IndexType.IPC_INDEC_TRANSPORTE,
    seriesId: '148.3_INIVELNAL_DICI_M_40',
    label: 'Transporte',
  },
  {
    indexType: IndexType.IPC_INDEC_COMUNICACION,
    seriesId: '148.3_INIVELNAL_DICI_M_41',
    label: 'Comunicación',
  },
  {
    indexType: IndexType.IPC_INDEC_RECREACION,
    seriesId: '148.3_INIVELNAL_DICI_M_42',
    label: 'Recreación',
  },
  {
    indexType: IndexType.IPC_INDEC_EDUCACION,
    seriesId: '148.3_INIVELNAL_DICI_M_43',
    label: 'Educación',
  },
  {
    indexType: IndexType.IPC_INDEC_RESTAURANTES,
    seriesId: '148.3_INIVELNAL_DICI_M_44',
    label: 'Restaurantes',
  },
  {
    indexType: IndexType.IPC_INDEC_VARIOS,
    seriesId: '148.3_INIVELNAL_DICI_M_45',
    label: 'Varios',
  },
]

export function getSeriesIdForIndexType(indexType: IndexType): string {
  const found = IPC_SERIES_CONFIG.find((s) => s.indexType === indexType)
  return found?.seriesId ?? IPC_SERIES_CONFIG[0].seriesId
}
