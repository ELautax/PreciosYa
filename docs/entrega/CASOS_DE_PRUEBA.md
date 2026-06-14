# Casos de prueba — PreciosYa

**Convención:** CP-XXX trazado a CU-XXX y RF-W/RF-A.  
**Tipo:** M = Manual demo | A = Automatizado (Vitest)

---

## Autenticación

| ID | CU | RF | Tipo | Precondición | Pasos | Resultado esperado |
|----|----|----|------|--------------|-------|-------------------|
| CP-001 | CU-01 | RF-W001 | M | Sin sesión | Login Google | Dashboard carga; nombre visible |
| CP-002 | CU-01 | RF-W003 | M | Sesión activa | Cerrar sesión | Redirige login; API 401 |

## Productos

| ID | CU | RF | Tipo | Precondición | Pasos | Resultado esperado |
|----|----|----|------|--------------|-------|-------------------|
| CP-010 | CU-04 | RF-W020 | M | Local activo | Crear producto costo 100 margen 30% | Precio venta redondeado decenas |
| CP-011 | CU-04 | RF-W021 | M | Cámara OK | Escanear barcode conocido | Autocompleta nombre |
| CP-012 | CU-05 | RF-W020 | A | Mock API | PUT producto cambia costo | `sale.service` tests pasan |
| CP-013 | CU-06 | RF-W022 | M | min_margin 20% | Producto margen 15% | Badge alerta rojo |

## Índices

| ID | CU | RF | Tipo | Precondición | Pasos | Resultado esperado |
|----|----|----|------|--------------|-------|-------------------|
| CP-020 | CU-08 | RF-W031 | M | IPC mes disponible | Apply IPC | Costos suben; banner verde |
| CP-021 | CU-09 | RF-W032 | M | Rubro USD activo | Apply USD | Solo rubro USD afectado |
| CP-022 | CU-07 | RF-W033 | M | Productos cargados | Bulk +10% | Historial BULK_PCT |
| CP-023 | CU-08 | RF-W031 | A | Mock | integration apply-ipc | 200 + productos updated |

## Ventas

| ID | CU | RF | Tipo | Precondición | Pasos | Resultado esperado |
|----|----|----|------|--------------|-------|-------------------|
| CP-030 | CU-12 | RF-W050 | M | 2 productos | Registrar venta 2 líneas | Toast éxito; historial |
| CP-031 | CU-12 | RF-W050 | A | Mock | POST /api/sales | Snapshots en sale_lines |
| CP-032 | CU-11 | RF-W051 | M | Ventas hoy | Resumen período Hoy | KPI > 0 |
| CP-033 | CU-13 | RF-W052 | M | Plan Free | Historial > 7 días atrás | No listado |
| CP-034 | CU-11 | RF-W053 | M | Plan Free | Tab Análisis | Banner upgrade Pro |

## Export y planes

| ID | CU | RF | Tipo | Precondición | Pasos | Resultado esperado |
|----|----|----|------|--------------|-------|-------------------|
| CP-040 | CU-14 | RF-W040 | M | Productos activos | Export PNG | Descarga/compartir OK |
| CP-041 | CU-15 | RF-W061 | M | Plan Free | Settings → Mejorar plan | Modal 3 planes |

## APK

| ID | CU | RF | Tipo | Precondición | Pasos | Resultado esperado |
|----|----|----|------|--------------|-------|-------------------|
| CP-A001 | CU-18 | RF-A001 | M | Android | Descargar APK landing | Instala sin error |
| CP-A002 | CU-18 | RF-A003 | M | APK instalada | Abrir app | Login y dashboard |
| CP-A003 | CU-04 | RF-A005 | M | Permiso cámara | Escáner en APK | Detecta código |

## PricingEngine (automático)

| ID | RF | Tipo | Caso | Resultado |
|----|----|------|------|-----------|
| CP-P01 | RF-W020 | A | calculateSalePrice(100, 30) | 130 → redondeo 130 |
| CP-P02 | RF-W031 | A | applyIPC costo | newCost correcto |
| CP-P03 | RF-W050 | A | lineProfit | revenue - cost |

Archivo tests: `packages/shared/src/__tests__/pricing.test.ts`, `sales.test.ts`

---

## Suite demo tesis (5–7 min)

Ejecutar en orden en **producción** con cuenta de prueba:

1. CP-001 Login
2. CP-010 Crear producto
3. CP-020 Apply IPC (o CP-023 si Alphacast falla, admin manual)
4. CP-030 Registrar venta
5. CP-032 Resumen ventas
6. CP-040 Export PNG

Checklist operativo: [CHECKLIST_DEMO.md](./CHECKLIST_DEMO.md)

---

## Cobertura automatizada vs manual

| Área | Automatizado | Manual demo |
|------|--------------|-------------|
| PricingEngine | ✓ completo | — |
| API contracts | ✓ parcial (mock) | — |
| OAuth Google | — | ✓ CP-001 |
| Escáner cámara | — | ✓ CP-011, CP-A003 |
| Export PNG | — | ✓ CP-040 |
| UI ventas | — | ✓ CP-030-034 |
