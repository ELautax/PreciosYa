# Railway — variables del servicio API

Proyecto: servicio **api** en Railway (`https://api-production-3626.up.railway.app` o similar).

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
| `BCRA_API_BASE_URL` | Reserva para cotización USD BCRA (no usada por el cron IPC hoy) |

## Eliminar en Railway (ya no se usan)

| Variable | Motivo |
|----------|--------|
| `INDEC_API_BASE_URL` | API datos.gob.ar **removida** del código |

Después de borrar variables obsoletas: **Redeploy** el servicio api.

## Vercel (proyecto web)

Solo necesitás `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. No hay variables de datos.gob.ar en Vercel.
