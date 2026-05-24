# Fuentes IPC — PreciosYa v2

## Problema

La API de [datos.gob.ar](https://datos.gob.ar) (`apis.datos.gob.ar/series`) suele **demorar** respecto al comunicado del [INDEC](https://www.indec.gob.ar). PreciosYa necesita variación mensual `%` por **división COICOP** (12 rubros).

## Estrategia adoptada (v2)

| Prioridad | Fuente | Uso |
|-----------|--------|-----|
| 1 | **API Series Tiempo AR** (`apis.datos.gob.ar`) | Fetch automático diario 03:00 AR; múltiples `ids` con `:percent_change&last=1` |
| 2 | **INDEC informes PDF** | Referencia humana / validación cuando la API no publicó el mes |
| 3 | **Admin `POST /api/admin/ipc/force-fetch`** | Reintento manual + entrada futura de override |

Configuración de series: [`apps/api/src/services/ipc-fetch/ipc-series.config.ts`](../apps/api/src/services/ipc-fetch/ipc-series.config.ts).

## Divisiones COICOP (12) → `IndexType`

| División INDEC | `IndexType` en DB | Serie datos.gob.ar (variación mensual) |
|----------------|-------------------|----------------------------------------|
| Nivel general (fallback) | `IPC_INDEC` | `148.3_INIVELNAL_DICI_M_26` |
| Alimentos y bebidas no alcohólicas | `IPC_INDEC_ALIMENTOS` | `148.3_INIVELNAL_DICI_M_34` |
| Bebidas alcohólicas y tabaco | `IPC_INDEC_BEBIDAS` | `148.3_INIVELNAL_DICI_M_35` |
| Prendas de vestir y calzado | `IPC_INDEC_VESTIMENTA` | `148.3_INIVELNAL_DICI_M_36` |
| Vivienda, agua, electricidad, gas | `IPC_INDEC_VIVIENDA` | `148.3_INIVELNAL_DICI_M_37` |
| Equipamiento y mantenimiento del hogar | `IPC_INDEC_HOGAR` | `148.3_INIVELNAL_DICI_M_38` |
| Salud | `IPC_INDEC_SALUD` | `148.3_INIVELNAL_DICI_M_39` |
| Transporte | `IPC_INDEC_TRANSPORTE` | `148.3_INIVELNAL_DICI_M_40` |
| Comunicación | `IPC_INDEC_COMUNICACION` | `148.3_INIVELNAL_DICI_M_41` |
| Recreación y cultura | `IPC_INDEC_RECREACION` | `148.3_INIVELNAL_DICI_M_42` |
| Educación | `IPC_INDEC_EDUCACION` | `148.3_INIVELNAL_DICI_M_43` |
| Restaurantes y hoteles | `IPC_INDEC_RESTAURANTES` | `148.3_INIVELNAL_DICI_M_44` |
| Bienes y servicios varios | `IPC_INDEC_VARIOS` | `148.3_INIVELNAL_DICI_M_45` |

> Los sufijos `_M_35`…`_M_45` siguen el patrón del catálogo INDEC en datos.gob.ar. Si una serie no responde, el fetcher **reutiliza `IPC_INDEC` general** para ese tipo y lo registra en logs.

## Formato de respuesta esperado

```json
{ "data": [["2026-02-01", 0.029], ...] }
```

Valores decimales `0.029` = 2,9% → normalizar a `2.9` en backend (`normalizeIndecPercentValue`).

## Plan B

- Cron 03:00 reintenta; si falla todo el lote, se mantiene el último mes en `economic_indices`.
- Notificación `NEW_IPC` solo cuando hay mes nuevo en `IPC_INDEC` general.
- Roadmap: override manual por división en Admin (TASK futuro).

## Referencias

- [API Series — documentación](https://datosgobar.github.io/series-tiempo-ar-api/reference/api-reference/)
- [INDEC — IPC divisiones (PDF)](https://www.indec.gob.ar/uploads/informesdeprensa/ipc_01_2517A7124C09.pdf)
