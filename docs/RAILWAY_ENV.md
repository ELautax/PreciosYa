# Railway — variables del servicio API

Proyecto: servicio **api** en Railway (`https://api-production-3626.up.railway.app` o similar).

## Rama de deploy (importante)

El código nuevo (IPC manual, sin datos.gob.ar) está en **`Trincheras`**.

En Railway → servicio **api** → **Settings** → **Source** → **Branch** debe ser **`Trincheras`**, no `main`.

Después de cada push: **Deployments** → último deploy **Success**, o **Redeploy**.

Comprobar versión en producción:

```bash
curl https://api-production-3626.up.railway.app/health
```

Debe incluir `"ipcManualRoute":true` y `"version":"0.2.0"`. Si falta, el servicio sigue con build viejo (por eso `POST /api/admin/ipc/manual` da **404**).

## Obligatorias (producción)

| Variable | Uso |
|----------|-----|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Pooler Supabase (6543) con `pgbouncer=true` |
| `DIRECT_URL` | Postgres directo (5432) |
| `SUPABASE_URL` | URL del proyecto |
| `SUPABASE_SERVICE_ROLE_KEY` | Auth servidor |
| `SUPABASE_ANON_KEY` | Refresh token |
| `JWT_SECRET` | ≥ 32 caracteres |
| `RESEND_API_KEY` | Emails |
| `FRONTEND_URL` | URLs Vercel separadas por coma (CORS) |
| `ALPHACAST_API_KEY` | IPC mensual (Alphacast dataset 5515) |

## Opcionales útiles

| Variable | Uso |
|----------|-----|
| `ALPHACAST_IPC_DATASET_ID` | Default `5515` |
| `ALPHACAST_API_BASE_URL` | Default `https://api.alphacast.io` |
| `ALPHACAST_DOWNLOAD_URL` | Enlace CSV si la key da 401 |
| `ADMIN_EMAILS` | Emails admin separados por coma |
| `PORT` | Railway suele inyectarla |

## Mantener (futuro)

| Variable | Uso |
|----------|-----|
| `BCRA_API_BASE_URL` | API BCRA cotización USD |
| `BCRA_USD_ALERT_THRESHOLD_PCT` | Umbral % para alerta salto USD (default `2.5`) |

## Mercado Pago — suscripción Pro

| Variable | Uso |
|----------|-----|
| `MP_ACCESS_TOKEN` | Access Token TEST o PROD de la app MP |
| `MP_PUBLIC_KEY` | Public Key (referencia; checkout es redirect) |
| `MP_PRO_AMOUNT_ARS` | Monto mensual Pro (default `4500`) |
| `MP_NOTIFICATION_URL` | Webhook público, ej. `https://api-production-3626.up.railway.app/api/webhooks/mercadopago` |
| `MP_TEST_PAYER_EMAIL` | Email **ficticio** para crear la suscripción en sandbox (default `preciosya.sandbox.buyer@gmail.com`). Evita pre-asociar tu Gmail real. |
| `MP_TEST_PAYER_USERNAME` | Referencia del comprador de prueba en panel MP (no usarlo para login en checkout — ver abajo). |

En el panel MP → **Webhooks**, topic `subscription_preapproval` (también configurable vía MCP `save_webhook`).

**Credenciales:** Railway debe usar `TEST-…` (no `APP_USR-…` de producción). App Preciosya_Arg `4079496323452400`.

**Sandbox URL webhook:** `callback_sandbox` → `https://api-production-3626.up.railway.app/api/webhooks/mercadopago`

**Tesis / sandbox — flujo correcto:**

1. PreciosYa con Google → **Suscribirme a Pro** → redirect a MP.
2. **Incógnito.** Si MP muestra tu cuenta real → **cerrar sesión**.
3. **No** iniciar sesión con `TESTUSER3869021386766079933` (la suscripción queda ligada a un payer invitado distinto y MP responde *«Una de las partes es de prueba»*).
4. Tarjeta de prueba **nueva** (no guardada): `5031 7557 3453 0604`, titular **`APRO`**, CVV `123`, DNI `12345678`.
5. Tras confirmar, volver a PreciosYa → Plan → sincronizar, o esperar webhook `subscription_preapproval`.

**Producción:** reemplazar tokens TEST por PROD y revalidar webhook.

## Migraciones en producción

`prisma migrate deploy` desde Railway a veces **no alcanza** `DIRECT_URL` (5432). Si ves locales vacíos o error al crear productos, ejecutá el SQL de **[FIX_MIGRACIONES_202606.md](./FIX_MIGRACIONES_202606.md)** en el SQL Editor de Supabase y redeploy.

## Eliminar en Railway (ya no se usan)

| Variable | Motivo |
|----------|--------|
| `INDEC_API_BASE_URL` | API datos.gob.ar **removida** del código |

Después de borrar variables obsoletas: **Redeploy** el servicio api.

## Vercel (proyecto web)

Solo necesitás `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. No hay variables de datos.gob.ar en Vercel.
