# Reparación urgente — locales / productos (jun 2026)

Si la app muestra **«Creá un local»** teniendo local, o **no guarda productos**, la API en Railway suele estar con **Prisma nuevo** pero **DB sin migrar** (`last_ipc_applied_period`, `BCRA_USD_ALERT`, etc.).

## Opción A — Railway (recomendado)

Tras el próximo deploy, el contenedor ejecuta `pnpm --filter api db:deploy` antes de `start` (ver `apps/api/Dockerfile` y `server.ts`).

1. Redeploy del servicio **api** en Railway.
2. Revisar logs: debe aparecer `[db] aplicando migraciones pendientes`.

## Opción B — SQL manual en Supabase

En **SQL Editor** del proyecto Supabase:

```sql
ALTER TABLE "locals"
  ADD COLUMN IF NOT EXISTS "last_ipc_applied_period" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "last_usd_applied_period" TIMESTAMP(3);
```

Si el enum aún no tiene el valor (solo si falla notificaciones USD):

```sql
ALTER TYPE "NotifType" ADD VALUE IF NOT EXISTS 'BCRA_USD_ALERT';
```

(Postgres &lt; 15 puede no soportar `IF NOT EXISTS` en enums; en ese caso usar solo `ADD VALUE 'BCRA_USD_ALERT'` una vez.)

## Verificación

- `GET /api/locals` con tu JWT → lista con tus locales.
- Crear producto con costo &gt; 0.

## Estado (jun 2026)

Aplicado en Supabase vía MCP:

- Migración `local_index_applied_period` — columnas `last_ipc_applied_period`, `last_usd_applied_period` en `locals`.
- Migración `bcra_usd_alert_notif_type` — valor `BCRA_USD_ALERT` en enum `NotifType`.

Locales activos verificados en DB (ej. «Kiosco Lautaro», «Kiosco1»).
