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

Tras aplicar, el sistema marca el período como **aplicado** para ese local y deja de mostrar el banner de “pendiente” hasta el próximo índice.

### 6. Historial y alertas

Cada cambio de costo queda en `price_history` con motivo (manual, IPC, USD, import, masivo). Alertas si el margen cae bajo el mínimo del local.

### 7. Exportación

Lista de precios en **PNG** para compartir (WhatsApp, redes). PDF planificado.

### 8. Administración

Panel admin: carga manual de IPC, usuarios, métricas básicas.

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

- **FREE:** límites de productos y locales.
- **PRO:** más capacidad, email al publicarse IPC.
- **AGENCY:** reservado multi-cliente (futuro).

Mercado Pago / suscripciones automáticas: en standby.

---

## Roadmap sugerido (próximos 2 meses)

Prioridad para presentación:

1. **Deploy API al día** (migraciones BCRA + `last_*_applied_period`).
2. Onboarding guiado (primer local → activar rubros → primer producto).
3. PDF export y/o WhatsApp share nativo.
4. Gráfico IPC/USD en dashboard (ya hay Chart.js).
5. Semilla de catálogo de barras (más autofill).
6. Página de ayuda in-app enlazando [GUIA_USUARIO.md](./GUIA_USUARIO.md).
7. Multi-usuario por local (post-MVP).
8. Suscripción Mercado Pago.

---

## Contacto y repositorio

Código: monorepo PreciosYa (rama principal de desarrollo según equipo).

Documentación viva en `/docs`; modificar este archivo cuando cambie el alcance del producto.
