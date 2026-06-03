# Variables de entorno: Supabase + PreciosYa

Esta guía indica **qué pegar** y **dónde configurarlo** en **Supabase**, **Railway (API)** y **Vercel (web)**. La app en producción no usa URLs de desarrollo local.

---

## 1. Abrir tu proyecto en Supabase

1. Entrá a [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Abrí el proyecto **PreciosYa** (o el nombre que le hayas puesto).

La URL del navegador se parece a:

`https://supabase.com/dashboard/project/<PROJECT_REF>/`

El fragmento `<PROJECT_REF>` es tu **referencia del proyecto** (no es secreta).

---

## 2. Datos que salen de **Project Settings → API**

Menú lateral: **Project Settings** (ícono de engranaje) → **API**.

| Qué necesitás | Variable | Dónde configurarla |
|---------------|----------|-------------------|
| URL del proyecto | `SUPABASE_URL` | **Railway** → servicio api |
| URL del proyecto | `VITE_SUPABASE_URL` | **Vercel** → proyecto web |
| Clave pública (browser) | `VITE_SUPABASE_ANON_KEY` | **Vercel** → proyecto web |
| Clave de servidor | `SUPABASE_SERVICE_ROLE_KEY` | **Railway** → servicio api |
| (Opcional en API) | `SUPABASE_ANON_KEY` | **Railway** → servicio api |

**Importante**

- `VITE_SUPABASE_URL` debe ser exactamente la **Project URL** (empieza con `https://`), no la contraseña ni el host de Postgres.
- La clave **`service_role`** y la **`anon`** son distintas: si mezclás la anon donde va service_role, Auth en el servidor falla.
- **No** pegues `service_role` en Vercel ni en archivos versionados.

---

## 3. Datos que salen de **Project Settings → Database**

**Project Settings** → **Database**.

| Qué necesitás | Variable | Dónde |
|---------------|----------|--------|
| Cadena de conexión Postgres | `DATABASE_URL` | **Railway** → servicio api |
| Conexión “directa” (migraciones) | `DIRECT_URL` | **Railway** → servicio api |

**`DATABASE_URL`:** **Connection pooling** (Supabase pooler, puerto **6543**) para la app en producción. La URI debe incluir **`pgbouncer=true`** en el query string (Prisma + PgBouncer en modo transacción; si falta, aparecen errores intermitentes `prepared statement "sN" does not exist`).

**`DIRECT_URL`:** URI **directa** al Postgres (puerto **5432**, host `db.<ref>.supabase.co`). Prisma usa `directUrl` para `migrate`; no uses el pooler aquí. Obligatorio en producción (`NODE_ENV=production`).

Si la contraseña tiene caracteres especiales (`@`, `#`, `$`, etc.), tenés que **URL-encodarlos** dentro de la URI (por ejemplo `@` → `%40`).

---

## 4. Resumen por plataforma

### Railway — servicio **api**

| Variable | Origen / valor |
|----------|----------------|
| `DATABASE_URL` | Database → Connection string → pooler (6543) + `pgbouncer=true` |
| `DIRECT_URL` | Database → conexión directa (5432) |
| `SUPABASE_URL` | API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | API → service_role |
| `SUPABASE_ANON_KEY` | API → anon (opcional) |
| `JWT_SECRET` | String aleatorio ≥ 32 caracteres (único en producción) |
| `FRONTEND_URL` | URLs **HTTPS** del front en Vercel, separadas por coma (CORS). Ej.: `https://preciosya.vercel.app,https://web-rho-ten-99.vercel.app`. Ver `docs/DEPLOY_VERCEL.md`. |
| `ALPHACAST_API_KEY` | Clave `ak_…` de [Alphacast](https://www.alphacast.io/) — ver `docs/ALPHACAST_SETUP.md`. |
| `ALPHACAST_IPC_DATASET_ID` | Opcional, default `5515` |
| `ALPHACAST_API_BASE_URL` | Opcional, default `https://api.alphacast.io` |

Lista completa y variables obsoletas: **`docs/RAILWAY_ENV.md`**.

### Vercel — proyecto **web**

| Variable | Valor |
|----------|--------|
| `VITE_API_URL` | URL pública del API en **Railway** (pestaña *Networking*, formato `https://….up.railway.app`), **sin** `/` al final. Ej. producción: `https://api-production-3626.up.railway.app` |
| `VITE_SUPABASE_URL` | **Misma** Project URL que `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | API → anon **public** |

Deploy y dominios: **`docs/DEPLOY_VERCEL.md`**.

### Migración v2 (mayo 2026)

Aplicada en remoto: `category_templates`, `categories.is_active` / `template_id`, `products.margin_status`, `ProductUnit`, valores extra de `IndexType`. Si hace falta aplicar migraciones pendientes: SQL Editor de Supabase (ver `docs/FIX_MIGRACIONES_202606.md`) o `pnpm --filter api exec prisma migrate deploy` desde una máquina con `DIRECT_URL` válido. Si falla el enum en una sola transacción, aplicar primero los `ADD VALUE` del enum y luego el resto.

---

## 5. Comprobar que funcionó (producción)

1. **API:** `curl https://api-production-3626.up.railway.app/health` → JSON con `"ok": true` (ajustá la URL si tu servicio Railway tiene otro host).
2. **Web:** abrí https://preciosya.vercel.app (o tu dominio en Vercel), iniciá sesión y verificá que carguen locales y productos.
3. Si el front no llega al API: revisá `VITE_API_URL` en Vercel (redeploy tras cambiar variables) y `FRONTEND_URL` en Railway (todas las URLs desde las que abrís la app).

Errores frecuentes al pegar keys: espacios o comillas de más; `VITE_*` solo en el proyecto **web** de Vercel, no en Railway.

---

## 6. Prisma: `Can't reach database server` (Supabase)

La causa más habitual en **Windows** o redes **solo IPv4** no es que la base esté caída, sino la **URI “directa”** al host `db.<ref>.supabase.co`: Supabase documenta que esa conexión usa **IPv6 por defecto**; si tu PC o red no llegan por IPv6, Prisma no establece TCP y devuelve “Can’t reach”. La referencia oficial es [Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres) (apartados *Direct connection* y *Pooler session mode*).

### Qué hacer (orden recomendado)

1. **Session pooler (primera opción)**  
   En el dashboard: botón **Connect** → método **Session pooler** (Shared pooler / “Session mode”). Copiá la URI y usala como `DATABASE_URL` en Railway. Usuario tipo `postgres.<project_ref>`, host tipo `aws-<n>-<región>.pooler.supabase.com`, puerto **5432**. Suele incluir `sslmode`. Funciona por **IPv4 e IPv6**.

2. **SSL**  
   Si armás la URI a mano, agregá `?sslmode=require` si el panel no lo incluye.

3. **Contraseña con caracteres especiales**  
   Codificá (`@` → `%40`, etc.) dentro de la URI.

4. **Puerto 5432 bloqueado en la red**  
   Si incluso el pooler falla, probá otra red o **Transaction pooler** (puerto **6543**); con Prisma + PgBouncer en modo transacción pueden hacer falta parámetros extra (`pgbouncer=true`). Para el backend Express de PreciosYa suele bastar **Session pooler** en `DATABASE_URL` y **directa** solo en `DIRECT_URL` para migraciones.

### Comprobar conexión (opcional, desde el repo)

Si tenés `apps/api/.env` solo para operaciones (no versionado), con `DATABASE_URL` correcto:

```powershell
pnpm --filter api db:check
```

Debería imprimir `Prisma: conexión OK`. En producción el chequeo principal es `/health` en Railway.
