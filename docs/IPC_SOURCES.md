# Fuentes IPC — PreciosYa

Variación mensual del IPC (%) por **nivel general** y **12 divisiones COICOP**, alineado con publicaciones del [INDEC](https://www.indec.gob.ar).

## Orden de fetch (backend)

| Prioridad | Fuente | Uso |
|-----------|--------|-----|
| 1 | **Alphacast** (dataset [5515](https://www.alphacast.io/datasets/consumer-price-index-grouped-5515)) | CSV con `ALPHACAST_API_KEY` — 13 series (`… - current_prices_mom`). Ver `docs/ALPHACAST_SETUP.md`. |
| 2 | **Argly** (`api.argly.com.ar/v1/ipc`) | Solo si Alphacast falla: guarda **solo** IPC nivel general; cada rubro del comercio usa su división COICOP cuando Alphacast o carga manual la proveen. |
| 3 | **Admin manual** | `POST /api/admin/ipc/manual` — período y % por división. |

**No se usa** la API de [datos.gob.ar](https://datos.gob.ar) (suele ir meses atrasada, p. ej. enero).

## Código

- Fetch: `apps/api/src/services/ipc-fetch/ipc-fetch.service.ts`
- Parser CSV: `apps/api/src/services/ipc-fetch/alphacast.service.ts`
- Columnas: `apps/api/src/services/ipc-fetch/alphacast.config.ts`

## Cron y notificaciones

- Job diario 03:00 AR: `apps/api/src/jobs/ipc-scheduler.ts`
- Notificación `NEW_IPC` cuando hay mes nuevo en `IPC_INDEC` general.

## Referencias

- [INDEC — IPC](https://www.indec.gob.ar)
