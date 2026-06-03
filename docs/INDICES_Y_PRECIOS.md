# Índices y política de precios

## Decisión de diseño: índice por rubro, no por producto

PreciosYa indexa por **categoría (rubro)**, no por producto individual.

**Motivos:**

1. **Coherencia con INDEC:** el IPC se publica por divisiones de gasto; los rubros del sistema mapean esas divisiones.
2. **Menos errores:** el comerciante configura una vez “Ferretería → USD” o “Almacén → IPC alimentos”.
3. **Actualización masiva:** un solo clic aplica el índice correcto a todos los productos del rubro.
4. **Mayoría de negocios:** mezclan productos locales (IPC) e importados (USD) por **línea de negocio**, no SKU a SKU.

### ¿Cuándo tendría sentido IPC/USD por producto?

- Catálogos muy heterogéneos dentro del **mismo rubro** (poco común en minoristas chicos).
- Si en el futuro hace falta, se puede añadir override por producto; hoy se evita para no complicar la UI.

### Qué ve el usuario al cargar producto

- Selector de **rubro** + texto explicativo del índice que aplicará.
- En la tarjeta del producto: badge `Rubro · IPC` o `Rubro · USD`.

---

## IPC (mensual)

- Fuente: INDEC vía Alphacast/Argly o carga manual admin.
- Almacenado en `economic_indices` por `IndexType` (general, alimentos, etc.).
- **Aplicar IPC** multiplica costos según el % del rubro de cada producto.
- Productos **sin rubro** usan IPC nivel general.
- Rubros con **Indexar USD** quedan **excluidos** del IPC masivo.

**Estado aplicado:** `locals.last_ipc_applied_period` (mes del IPC aplicado). El front compara con `ipc.period` del último índice.

---

## USD oficial BCRA (diario)

- Endpoint: `GET /estadisticascambiarias/v1.0/Cotizaciones/USD`
- Se guarda:
  - `value_pct` = variación % vs día hábil anterior
  - `usdRateArs` en respuesta API (codificado en `source_url` como `|usdRate=1427`)
- **Aplicar USD** solo en rubros `BCRA_USD_OFICIAL`.
- Alertas si `|variación| >= BCRA_USD_ALERT_THRESHOLD_PCT` (default 2.5%).

**Estado aplicado:** `locals.last_usd_applied_period` (fecha del día BCRA aplicado).

**Reparación de datos viejos:** si en DB hay filas BCRA de la API antigua (reservas), `GET /api/ipc/latest` fuerza refresh cuando `usdRateArs` falta o `value_pct` es inválido.

---

## API relevante

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/ipc/latest` | IPC + BCRA (con sync si hace falta) |
| GET | `/api/locals/:id/ipc-breakdown` | Desglose IPC por rubro |
| PUT | `/api/locals/:id/apply-ipc` | Aplica IPC |
| GET | `/api/locals/:id/usd-breakdown` | Rubros USD + variación |
| PUT | `/api/locals/:id/apply-usd` | Aplica USD |
| PATCH | `/api/categories/:id` | `{ indexByUsd: true }` |

---

## Historial (`price_history`)

| `change_reason` | Significado |
|-----------------|-------------|
| `MANUAL` | Edición en ficha |
| `BULK_PCT` | % manual masivo |
| `IPC_INDEC` | Aplicación IPC |
| `BCRA_RATE` | Aplicación USD |
| `IMPORT` | CSV |

`ipc_reference` guarda el % aplicado en IPC/USD.
