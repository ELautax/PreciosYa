# Arquitectura técnica — PreciosYa

## Estructura del monorepo

```
PreciosYa/
├── apps/
│   ├── api/          # Express + Prisma
│   ├── web/          # React + Vite
│   └── landing/      # Marketing estático
├── packages/
│   └── shared/       # pricing, tipos, tests
└── docs/
```

## Flujo de autenticación

1. Supabase Auth (Google) en el front.
2. JWT enviado a la API en `Authorization: Bearer`.
3. `authMiddleware` valida y adjunta `req.user`.

## Base de datos (Prisma / Postgres)

Entidades principales:

- `users`, `locals`, `categories`, `category_templates`
- `products`, `price_history`
- `sales`, `sale_lines` (snapshots costo/precio por línea)
- `economic_indices`
- `notifications`, `price_lists`, `subscriptions`

Migraciones en `apps/api/prisma/migrations/`. Producción: `pnpm --filter api run db:deploy`.

## Servicios API destacados

| Servicio | Responsabilidad |
|----------|-----------------|
| `economic-index.service` | IPC, BCRA, `ensureFreshBcraInSnapshot`, apply IPC/USD, breakdown |
| `bcra.service` | Parseo cotización USD BCRA |
| `ipc-fetch/*` | Alphacast, Argly |
| `product.service` | CRUD, bulk, import CSV |
| `sale.service` / `sale-analytics.service` | Ventas, KPIs, rankings, estancados |
| `barcode-lookup.service` | Autofill código de barras |
| `notification.service` | IPC nuevo, salto USD |

## Jobs (`ipc-scheduler.ts`)

- 03:00 AR — sincronizar IPC, notificar usuarios.
- 03:30 AR — sincronizar USD, alertas de salto (`BCRA_USD_ALERT`).
- Al arrancar — catch-up si falta IPC o USD en DB.

### Campos `locals` (estado índices)

- `last_ipc_applied_period` — evita banner “IPC pendiente” tras aplicar el mes vigente.
- `last_usd_applied_period` — idem para variación USD del día.

## Frontend

- **TanStack Query** para cache (`ipc-latest`, `locals`, `products`, `sales`).
- Tokens CSS `--py-*` + clase `dark` para tema.
- PWA con Workbox.

## Deploy

| Componente | Host | Notas |
|------------|------|-------|
| web | Vercel | Raíz monorepo, `apps/web` |
| api | Railway | `pnpm start`, migraciones en deploy |
| DB | Supabase | Pooler 6543 + `pgbouncer=true` |

Variables críticas: ver `RAILWAY_ENV.md`, `SUPABASE_ENV.md`.

## Rutas API — Ventas (`/api/sales`)

| Método | Ruta | Plan |
|--------|------|------|
| POST | `/` | Free+ |
| GET | `/` | Free+ (historial máx. 7 días en Free) |
| GET | `/:id` | Free+ |
| GET | `/dashboard` | Free parcial / Pro completo |
| GET | `/top-products`, `/stagnant-products`, `/promote-products`, `/star-products`, `/category-performance` | Pro+ |

## Rutas API — Suscripciones (`/api/subscriptions`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/status` | JWT | Plan actual + última suscripción MP |
| POST | `/checkout` | JWT | Crea preapproval Pro → URL checkout MP |
| POST | `/sync` | JWT | Sincroniza estado pending con MP (post-redirect) |

## Webhook Mercado Pago

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/webhooks/mercadopago` | Ninguno (público) | Notificaciones `subscription_preapproval` |

Variables: `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_PRO_AMOUNT_ARS` (default 4500), `MP_NOTIFICATION_URL`. Ver `RAILWAY_ENV.md`.

## Tests

- `packages/shared`: pricing puro.
- `apps/api`: vitest unit + integration routes.
- `apps/web`: vitest + Testing Library (componentes clave).

## Versión API

Health en `/health` incluye flags de rutas (`ipcManualRoute`, etc.).
