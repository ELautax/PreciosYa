# Casos de uso — PreciosYa

## Actores

| Actor | Descripción |
|-------|-------------|
| **Comerciante** | Dueño o encargado del negocio (plan Free/Pro/Agency) |
| **Administrador** | Usuario con `is_admin`; gestiona IPC global y usuarios |
| **Sistema externo** | INDEC/Alphacast, BCRA, Google OAuth, Supabase |

---

## Diagrama general

```mermaid
flowchart LR
  Comerciante --> CU01[CU-01 Login]
  Comerciante --> CU05[CU-05 Gestionar productos]
  Comerciante --> CU08[CU-08 Aplicar IPC]
  Comerciante --> CU12[CU-12 Registrar venta]
  Comerciante --> CU14[CU-14 Exportar PNG]
  Admin --> CU16[CU-16 Admin IPC]
  SistemaExterno --> CU17[CU-17 Sync indices]
```

---

## Casos de uso detallados

### CU-01 — Iniciar sesión con Google
- **Actor:** Comerciante
- **RF:** RF-W001
- **Precondición:** Cuenta Google válida
- **Flujo principal:** 1) Abre app → 2) Toca Google → 3) OAuth Supabase → 4) API crea/recupera user → 5) Redirige dashboard
- **Postcondición:** Sesión JWT activa

### CU-02 — Crear local
- **Actor:** Comerciante | **RF:** RF-W010
- **Precondición:** Logueado; bajo límite plan
- **Flujo:** Settings/Locales → Nuevo → nombre → guardar
- **Postcondición:** Local activo en selector

### CU-03 — Activar rubros
- **Actor:** Comerciante | **RF:** RF-W012, RF-W013
- **Flujo:** Categorías → toggle rubro → opcional Indexar USD
- **Postcondición:** Rubro activo para productos e índices

### CU-04 — Alta producto con escáner
- **Actor:** Comerciante | **RF:** RF-W020, RF-W021
- **Flujo:** Productos → Nuevo → escanear barcode → costo + margen → guardar
- **Postcondición:** Producto con precio calculado

### CU-05 — Editar producto
- **Actor:** Comerciante | **RF:** RF-W020
- **Flujo:** Tap producto → modificar costo/margen → guardar
- **Postcondición:** `price_history` registra cambio MANUAL

### CU-06 — Ver alertas de margen
- **Actor:** Comerciante | **RF:** RF-W022, RF-W041
- **Flujo:** Dashboard muestra count → Productos filtro alertas
- **Postcondición:** Usuario identifica productos bajo mínimo

### CU-07 — Actualización masiva por %
- **Actor:** Comerciante | **RF:** RF-W033
- **Flujo:** Productos → Actualizar → % → preview → confirmar
- **Postcondición:** Costos actualizados; historial BULK_PCT

### CU-08 — Aplicar IPC al local
- **Actor:** Comerciante | **RF:** RF-W031
- **Precondición:** IPC del mes disponible; rubros IPC activos
- **Flujo:** Banner IPC → desglose por rubro → confirmar
- **Postcondición:** Costos actualizados; `last_ipc_applied_period` set

### CU-09 — Aplicar variación USD
- **Actor:** Comerciante | **RF:** RF-W032
- **Precondición:** Rubros con Indexar USD; cotización BCRA
- **Flujo:** Banner USD → apply-usd → confirmar
- **Postcondición:** Solo productos USD actualizados

### CU-10 — Consultar historial de precios
- **Actor:** Comerciante | **RF:** RF-W034
- **Flujo:** Historial → elegir producto → gráfico + tabla
- **Postcondición:** Usuario ve evolución y motivos

### CU-11 — Consultar resumen ventas
- **Actor:** Comerciante | **RF:** RF-W051
- **Flujo:** Ventas → Resumen → filtrar período
- **Postcondición:** KPIs y gráficos visibles (según plan)

### CU-12 — Registrar venta (carga del día)
- **Actor:** Comerciante | **RF:** RF-W050
- **Flujo:** Ventas → Registrar → escanear/buscar ítems → ajustar qty → fecha/hora → confirmar
- **Postcondición:** `sales` + `sale_lines` con snapshots

### CU-13 — Consultar historial ventas
- **Actor:** Comerciante | **RF:** RF-W052
- **Flujo:** Ventas → Historial → expandir venta
- **Postcondición:** Detalle líneas visible (Free: 7 días)

### CU-14 — Exportar lista PNG
- **Actor:** Comerciante | **RF:** RF-W040
- **Flujo:** Productos → Exportar → preview → compartir/descargar
- **Postcondición:** PNG en Storage + registro `price_lists`

### CU-15 — Consultar plan y mejorar
- **Actor:** Comerciante | **RF:** RF-W060, RF-W061
- **Flujo:** Settings → Plan → modal → mailto Pro/Agency
- **Postcondición:** Usuario informado de límites

### CU-16 — Admin: forzar IPC / gestionar usuarios
- **Actor:** Administrador | **RF:** RF-W062
- **Precondición:** `is_admin`
- **Flujo:** Admin → sync IPC o cambiar plan usuario
- **Postcondición:** Índices o plan actualizado

### CU-17 — Sincronizar índices (automático)
- **Actor:** Sistema (cron) | **RF:** RF-W030
- **Precondición:** Railway activo; fuentes Alphacast/BCRA disponibles
- **Flujo:**
  1. node-cron (timezone `America/Argentina/Buenos_Aires`)
  2. IPC: fetch diario **03:00 ART** (idempotente por período)
  3. USD BCRA: fetch diario **03:30 ART**
  4. Upsert en `economic_indices` (`type`, `value_pct`, `period`, `source_url`)
  5. Notificaciones in-app (`NEW_IPC` / `BCRA_USD_ALERT` según umbral)
- **Alternativa:** Fallback/cache; si no hay dato → admin CU-16
- **Postcondición:** Índices listos para CU-08/CU-09; banners pendientes en locales
- **Excepciones:** E1 fuente caída (log + cache); E2 período ya cargado (omitir)

### CU-18 — Instalar APK Android
- **Actor:** Comerciante | **RF:** RF-A001 … RF-A007
- **Flujo:** Landing descargar → instalar → abrir APK (`preciosya.vercel.app`, alias `preciosya-app.vercel.app`) → login
- **Postcondición:** Misma app web empaquetada en Android (pantalla completa si assetlinks es válido)

### CU-19 — Baja lógica de producto
- **Actor:** Comerciante | **RF:** RF-W009
- **Precondición:** Sesión activa; producto activo en el local
- **Flujo:** Productos → seleccionar → desactivar / eliminar lógico → API soft-delete (`is_active = false`)
- **Postcondición:** Producto deja de listarse y de exportarse; permanece en `price_history` y ventas históricas
- **Excepciones:** E1: producto con líneas de venta — no se borra físicamente (RESTRICT / soft delete)

### CU-20 — Notificaciones in-app
- **Actor:** Comerciante | **RF:** RF-W020
- **Precondición:** Sesión activa; Realtime habilitado
- **Flujo:** Evento (nuevo IPC, alerta margen, etc.) → API crea `notifications` (en `NEW_IPC`: `metadata.series` con las 13 series COICOP) → Supabase Realtime → campana in-app → en IPC: **Ver rubros** abre desglose gráfico (barras horizontales Chart.js + leyenda con íconos) vía `metadata` o `GET /api/ipc/series`
- **Postcondición:** Usuario ve título/cuerpo; puede marcar como leída; puede ir a Productos a aplicar IPC
- **Nota:** Sin push nativo (fuera de alcance v1)

### CU-21 — Modo offline limitado (lectura en caché)
- **Actor:** Comerciante | **RF:** RF-W024
- **Precondición:** App cargada previamente con conexión (Workbox / caché PWA)
- **Flujo:** Pérdida de red → banner offline → lectura de datos precacheados → sin edición ni sync bidireccional
- **Postcondición:** Usuario puede consultar catálogo en caché; al recuperar red se reanuda la API
- **Excepciones:** E1: primera visita sin caché → no hay datos offline

### NT-BUILD — Regenerar APK Android (desarrollador)
- **Actor:** Desarrollador / administrador técnico | **RF:** RF-A008
- **No es CU de comerciante.** Flujo: `node scripts/build-preciosya-apk.mjs` → actualizar `assetlinks.json` → deploy web → reasignar alias `preciosya.vercel.app` si aplica
- **Trazabilidad:** RF-A008 → NT-BUILD (sin CU-18)

---

## Matriz actor × caso de uso

| CU | Comerciante | Admin | Sistema | Desarrollador |
|----|:-----------:|:-----:|:-------:|:-------------:|
| 01-15, 18-21 | ✓ | | | |
| 16 | | ✓ | | |
| 17 | | | ✓ | |
| NT-BUILD | | | | ✓ |
