# PreciosYa — Alcance v1 y roadmap v2 (tesis)

Documento para **defensa / presentación ante profesores**: qué está entregado, qué queda explícitamente fuera, y qué se propone como **trabajo futuro** (v2).

---

## Cómo presentarlo (recomendación)

| Slide / bloque | Contenido |
|----------------|-----------|
| **Problema** | 94% de comercios argentinos actualizan precios a mano; pierden margen con la inflación. |
| **Solución v1** | Catálogo + IPC/USD por rubro + alertas + export PNG + **gestor de ventas** (no POS). |
| **Demo en vivo** | `preciosya.vercel.app`: producto → aplicar IPC → registrar venta → ver ganancia estimada. |
| **Limitaciones v1** | Sin stock, sin factura AFIP, sin cobro; ventas solo online; no editar/anular ventas. |
| **Trabajo futuro v2** | Ver sección abajo — **no hace falta implementarlo** para aprobar si v1 está estable y documentado. |

**No ampliar el alcance de v1 antes de la defensa** salvo pulidos de UX (v1.1). Es mejor un producto estable y demo clara que features a medias.

---

## Alcance v1 — congelado (entregable)

### Núcleo PreciosYa (MVP v1 + v2 rubros/IPC)

- Locales, rubros COICOP, productos con margen y precio calculado.
- IPC multi-serie (Alphacast) + USD BCRA por rubro.
- Aplicación masiva IPC/USD, historial de precios, alertas de margen.
- Export lista PNG, PWA, auth Google, planes Free/Pro/Agency (límites en API).
- Panel admin, schedulers, deploy Railway + Vercel + Supabase.

### Gestor de ventas v1

- Registro rápido: escáner, búsqueda, **una venta con N líneas**, `soldAt` editable.
- Snapshots `unit_cost_snapshot` + `unit_sale_price` (backend autoritativo).
- Tabs: Resumen, Registrar, Historial, Análisis.
- **Free:** registrar + resumen/historial **7 días**.
- **Pro/Agency:** períodos extendidos, ganancia estimada, top, estancados, promocionar, estrellas, por rubro.
- **Explícitamente NO:** POS, stock, pagos, tickets, clientes, AFIP, offline outbox, anular/editar ventas.

---

## v1.1 — Pulido (mismo alcance, sin features nuevas)

Mejoras ya hechas o previstas que **no cambian el contrato** de v1:

| Ítem | Estado |
|------|--------|
| Período personalizado con fechas en Resumen | Hecho |
| Sidebar colapsable + logout fijo | Hecho |
| Badge tipo usuario (Free/Pro/Agency/Admin) en header | Hecho |
| Acción rápida Panel → Registrar venta | Hecho |
| Docs alineados con producción | En curso |

**No entra en v1.1:** anular ventas, export de cierre, alertas margen-real, plantillas, offline.

---

## Roadmap v2 — trabajo futuro (propuesta para tesis)

Priorizado por valor para el comerciante y coherencia con PreciosYa (rentabilidad + precios, no caja registradora).

### Prioridad alta (extensión natural de v1)

1. **Anular / corregir venta** — soft void con motivo; auditoría en historial.
2. **Duplicar venta o “mismo pedido de ayer”** — acelera carga del día en kioscos.
3. **Alertas de margen real** — producto muy vendido con ganancia baja vs mínimo del local.
4. **Insight “Qué subir de precio”** — cruza rotación + margen snapshot + último IPC aplicado.
5. **Export / compartir cierre del día** — PNG o texto para WhatsApp/contador.

### Prioridad media

6. **Modo registro full-screen** — solo escáner + cantidad (menos fricción móvil).
7. **Plantillas de venta** — combos recurrentes (“desayuno”, “combo mediodía”).
8. **Comparativa post-IPC** — ventas/ganancia semana antes vs después de aplicar índice.
9. **Enlace Producto ↔ ventas** — desde ficha de producto ver unidades vendidas.
10. **Comparativa multi-local** (Agency) — mismo SKU en distintas sucursales.

### Prioridad baja / explícitamente post-v2

- Offline outbox para ventas.
- Descuento manual por línea.
- PDF export listas.
- Mercado Pago suscripciones.
- Multi-usuario por local.

### Fuera de alcance del producto (decisión de producto)

- Control de stock / inventario.
- Medios de pago, caja, turnos.
- Facturación fiscal AFIP.
- POS completo.

---

## Limitaciones conocidas (decirlas en la defensa)

- Migraciones Prisma: en Railway a veces `DIRECT_URL:5432` no alcanza; DDL aplicado vía Supabase SQL cuando haga falta.
- Gestor de ventas v1 requiere conexión (sin cola offline).
- Plan Free en ventas limitado a 7 días (decisión comercial, no técnica).
- Suscripciones Pro manuales (sin Mercado Pago automático en v1).

---

## Demo sugerida (5–7 minutos)

1. Login Google → crear/editar producto con escáner.
2. Mostrar rubro con IPC vs rubro indexado USD.
3. Aplicar IPC → ver historial de precio.
4. **Ventas → Registrar** → 2–3 ítems → confirmar.
5. **Resumen** → KPIs y gráfico; **Análisis** (cuenta Pro) → top y estancados.
6. Export PNG lista de precios.
7. Cierre: “v2 propone anular ventas, insights post-IPC y export de cierre”.

---

*Última actualización: junio 2026 — alineado con Gestor de Ventas v1 desplegado.*
