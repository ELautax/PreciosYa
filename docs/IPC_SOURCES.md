# Fuentes IPC — PreciosYa

Variación mensual del IPC (%) por **nivel general** y **12 divisiones COICOP**, alineado con publicaciones del [INDEC](https://www.indec.gob.ar).

## Orden de fetch (backend)

| Prioridad | Fuente | Uso |
|-----------|--------|-----|
| 1 | **Alphacast** (dataset [5515](https://www.alphacast.io/datasets/consumer-price-index-grouped-5515)) | CSV con `ALPHACAST_API_KEY` — 13 series (`… - current_prices_mom`). Ver `docs/ALPHACAST_SETUP.md`. |
| 2 | **Argly** (`api.argly.com.ar/v1/ipc`) | Solo si Alphacast falla: guarda **solo** IPC nivel general; cada rubro del comercio usa su división COICOP cuando Alphacast o carga manual la proveen. |
| 3 | **Admin manual** | `POST /api/admin/ipc/manual` — período y % por división. Listado: `GET /api/admin/indices?period=YYYY-MM` (sin period = último corte). |

**Período en DB:** primer día del mes en **UTC** (`YYYY-MM-01T00:00:00.000Z`). Las etiquetas de UI deben formatear con `timeZone: 'UTC'` (si no, en Argentina UTC−3 julio se muestra como junio).

**No se usa** la API de [datos.gob.ar](https://www.datos.gob.ar) (suele ir meses atrasada, p. ej. enero).

## Código

- Fetch: `apps/api/src/services/ipc-fetch/ipc-fetch.service.ts`
- Parser CSV: `apps/api/src/services/ipc-fetch/alphacast.service.ts`
- Columnas: `apps/api/src/services/ipc-fetch/alphacast.config.ts`

## Cron y notificaciones

- Job diario 03:00 AR: `apps/api/src/jobs/ipc-scheduler.ts`
- Notificación `NEW_IPC` cuando hay mes nuevo en `IPC_INDEC` general.

## Referencias

- [INDEC — IPC](https://www.indec.gob.ar)
