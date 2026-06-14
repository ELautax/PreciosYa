# PreciosYa — Documento de producto

## Resumen ejecutivo

**PreciosYa** es una plataforma web para comercios minoristas en Argentina que centraliza inventario, márgenes y actualización de precios usando **índices oficiales** (IPC INDEC por rubro y dólar oficial BCRA), sin hojas de cálculo dispersas.

**Problema:** La inflación y el tipo de cambio obligan a recalcular costos y precios de venta con frecuencia. Muchos negocios pierden margen por demoras, errores manuales o no saber qué índice aplicar a cada tipo de producto.

**Solución:** Un catálogo por local, rubros alineados al IPC, opción de indexar rubros sensibles al USD, aplicación masiva de índices con historial auditable, alertas de margen y exportación de listas (PNG).

---

## Usuarios objetivo

- Almacenes, kioscos, ferreterías, librerías, tiendas de electrónica, dietéticas.
- Dueños o encargados que cargan precios ellos mismos (1–3 locales).
- Plan **FREE** (límites) y **PRO** (más productos, locales, emails IPC).

---

## Módulos principales

### 1. Locales

Cada usuario puede tener uno o más **locales** (sucursales). Cada local tiene margen mínimo configurable y moneda (ARS).

### 2. Rubros (categorías)

Rubros precargados según divisiones **COICOP / IPC INDEC**. El comercio **activa** solo los que usa.

- Cada rubro tiene un **índice IPC** por defecto (ej. Alimentos → IPC alimentos).
- Toggle **«Indexar USD»**: ese rubro pasa a ajustarse por **variación diaria del dólar oficial BCRA**, no por IPC mensual.

### 3. Productos

- Nombre, costo, margen %, precio de venta calculado (redondeo a decenas).
- Código de barras + escáner móvil.
- Autocompletado por inventario propio, catálogo compartido PreciosYa u Open Food Facts.
- **El índice no se elige por producto** sino por **rubro** (ver [INDICES_Y_PRECIOS.md](./INDICES_Y_PRECIOS.md)).

### 4. Índices económicos

| Índice | Fuente | Frecuencia | Uso |
|--------|--------|------------|-----|
| IPC INDEC | Alphacast / Argly / Admin manual | Mensual | Rubros con IPC |
| USD oficial | API BCRA Estadísticas Cambiarias | Diaria | Rubros con «Indexar USD» |

Cron en API (~03:00 AR IPC, ~03:30 USD). Alertas in-app si el USD salta fuerte (umbral configurable).

### 5. Actualización masiva

- Por **porcentaje** manual (todos o un rubro).
- **Aplicar IPC** (excluye rubros USD).
- **Aplicar USD** (solo rubros indexados en USD).

Tras aplicar, el sistema guarda en el local `last_ipc_applied_period` / `last_usd_applied_period` y muestra banner **verde “ya aplicado”** hasta que haya un índice nuevo (no el CTA de “actualizar” indefinido).

### 6. Historial y alertas

Cada cambio de costo queda en `price_history` con motivo (manual, IPC, USD, import, masivo). Alertas si el margen cae bajo el mínimo del local.

### 7. Exportación

Lista de precios en **PNG** para compartir (WhatsApp, redes). PDF planificado.

### 8. Administración

Panel admin: carga manual de IPC, usuarios, métricas básicas.

### 9. Gestor de ventas

Registro rápido de ventas (escáner o búsqueda + cantidades en lote). **No es POS:** sin cobro, ticket ni stock.

- **Free:** registrar ventas; resumen e historial de **7 días** (KPIs básicos).
- **Pro/Agency:** dashboard completo (30/90 días, ganancia estimada), top productos, estancados, promocionar, estrellas, ventas por rubro.

Cada línea guarda **snapshot** de costo y precio al momento de la venta (rentabilidad histórica aunque suba el IPC después).

Detalle de alcance v1 vs propuesta v2 para la tesis: [ROADMAP_TESIS.md](./ROADMAP_TESIS.md).

---

## Alcance v1 vs v1.1 vs v2

| Versión | Qué es | Estado |
|---------|--------|--------|
| **v1** | Producto entregable: catálogo, IPC/USD, export, gestor de ventas (sin POS). | **Cerrado** — demo en producción. |
| **v1.1** | Pulido UX/docs sin ampliar contrato (sidebar, badges, acción rápida ventas). | En curso / menor. |
| **v2** | Trabajo futuro para tesis: anular ventas, insights margen, export cierre, etc. | Documentado, no obligatorio implementar. |

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite, Tailwind v4, TanStack Query, PWA |
| Backend | Node.js, Express 5, Prisma, Zod |
| DB / Auth | Supabase (Postgres + Auth Google) |
| API host | Railway |
| Web host | Vercel |
| Emails | Resend (IPC PRO) |

Monorepo **pnpm**: `apps/web`, `apps/api`, `packages/shared`.

---

## Modelo de negocio (borrador)

- **FREE:** límites de productos y locales; catálogo, rubros, escáner, export PNG; **ventas (7 días)**.
- **PRO:** más capacidad, **IPC por rubro**, **indexar al dólar BCRA**, alertas de margen, historial, **gestor de ventas completo**, email al publicarse IPC. **Suscripción mensual $4.500** vía Mercado Pago (sandbox en tesis; producción al go-live).
- **AGENCY:** multi-cliente / multi-local a escala; **precio a medida por contacto comercial** (sin tarifa fija publicada en la landing).

**Pagos Pro:** checkout hospedado Mercado Pago (Suscripciones). Agency sigue por mailto. Ver `docs/RAILWAY_ENV.md` (variables MP).

---

## Roadmap

- **v1 (entregable):** ver módulos arriba + [ROADMAP_TESIS.md](./ROADMAP_TESIS.md).
- **v2 (propuesta tesis):** anular ventas, duplicar venta, alertas margen real, “qué subir de precio”, export cierre del día, modo escáner full-screen — ver tabla completa en ROADMAP_TESIS.
- **Backlog general (post-tesis):** onboarding guiado, PDF export, multi-usuario por local, catálogo barras ampliado, ayuda in-app.

---

## Contacto y repositorio

Código: monorepo PreciosYa (rama principal de desarrollo según equipo).

Documentación viva en `/docs`; modificar este archivo cuando cambie el alcance del producto.
