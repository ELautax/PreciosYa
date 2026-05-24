# Variables de entorno: Supabase + PreciosYa

Esta guía indica **qué pegar**, **en qué archivo** y **dónde verlo en el dashboard**.

---

## 1. Crear los archivos locales (no se suben a Git)

En la raíz del monorepo:

**PowerShell (Windows)**

```powershell
Copy-Item "apps\api\.env.example" "apps\api\.env"
Copy-Item "apps\web\.env.example" "apps\web\.env"
```

Editá `apps\api\.env` y `apps\web\.env` con los valores de abajo.

---

## 2. Abrir tu proyecto en Supabase

1. Entrá a [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Abrí el proyecto **PreciosYa** (o el nombre que le hayas puesto).

La URL del navegador se parece a:

`https://supabase.com/dashboard/project/<PROJECT_REF>/`

El fragmento `<PROJECT_REF>` es tu **referencia del proyecto** (no es secreta).

---

## 3. Datos que salen de **Project Settings → API**

Menú lateral: **Project Settings** (ícono de engranaje) → **API**.

| Qué necesitás | Variable en tu repo | Dónde en la pantalla |
|---------------|---------------------|----------------------|
| URL del proyecto | `SUPABASE_URL` → **solo** `apps/api/.env`<br>`VITE_SUPABASE_URL` → **solo** `apps/web/.env` | **Project URL** — copiá la URL completa (`https://xxxxx.supabase.co`). |
| Clave pública (browser) | `VITE_SUPABASE_ANON_KEY` → **solo** `apps/web/.env` | **Project API keys** — la clave **`anon` `public`** (legacy JWT o la que indique “anon”). |
| Clave de servidor | `SUPABASE_SERVICE_ROLE_KEY` → **solo** `apps/api/.env` | **Project API keys** — la clave **`service_role` `secret`**. **No** la pegues en el frontend ni en archivos versionados. |
| (Opcional en API) | `SUPABASE_ANON_KEY` → `apps/api/.env` | Misma clave **anon** que arriba, si más adelante la usa el backend. |

**Importante**

- `VITE_SUPABASE_URL` debe ser exactamente la **Project URL** (empieza con `https://`), no la contraseña ni el host de Postgres.
- La clave **`service_role`** y la **`anon`** son distintas: si mezclás la anon donde va service_role, Auth en el servidor falla.

---

## 4. Datos que salen de **Project Settings → Database**

**Project Settings** → **Database**.

| Qué necesitás | Variable | Dónde |
|---------------|----------|--------|
| Cadena de conexión Postgres | `DATABASE_URL` → **solo** `apps/api/.env` | **Connection pooling** (Supabase pooler, puerto **6543**) para la app en producción. La URI debe incluir **`pgbouncer=true`** en el query string (Prisma + PgBouncer en modo transacción; si falta, aparecen errores intermitentes `prepared statement "sN" does not exist`). El código del API también añade `pgbouncer=true` si detecta pooler y falta el parámetro. |
| Conexión “directa” (migraciones) | `DIRECT_URL` → **solo** `apps/api/.env` | **Database** → URI **directa** al Postgres (puerto **5432**, host `db.<ref>.supabase.co`). Prisma usa `directUrl` para `migrate`; no uses el pooler aquí. Obligatorio en producción (`NODE_ENV=production`). |

Si la contraseña tiene caracteres especiales (`@`, `#`, `$`, etc.), tenés que **URL-encodarlos** dentro de la URI (por ejemplo `@` → `%40`).

---

## 5. Resumen rápido por archivo

### `apps/api/.env`

| Variable | Origen típico |
|----------|----------------|
| `DATABASE_URL` | Database → Connection string → URI |
| `DIRECT_URL` | Database → connection directa (opcional) |
| `SUPABASE_URL` | API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | API → service_role |
| `SUPABASE_ANON_KEY` | API → anon (opcional) |
| `JWT_SECRET` | Generá un string aleatorio ≥ 32 caracteres (local puede ser el placeholder hasta producción) |
| `FRONTEND_URL` | En local: `http://localhost:5173`. En **Railway (API)**: lista separada por coma de URLs **HTTPS** del front en Vercel (ej. `https://preciosya.vercel.app,https://web-rho-ten-99.vercel.app`) para CORS. Ver también `docs/DEPLOY_VERCEL.md`. |
| `ALPHACAST_API_KEY` | Clave `ak_…` de [Alphacast](https://www.alphacast.io/) — **IPC mensual** (general + 12 divisiones). Ver **`docs/ALPHACAST_SETUP.md`**. |
| `ALPHACAST_IPC_DATASET_ID` | Opcional, default `5515` (dataset INDEC agrupado). |
| `ALPHACAST_API_BASE_URL` | Opcional, default `https://api.alphacast.io`. |

### Migración v2 (mayo 2026)

Aplicada en remoto: `category_templates`, `categories.is_active` / `template_id`, `products.margin_status`, `ProductUnit`, valores extra de `IndexType`. En local: `pnpm --filter api exec prisma migrate deploy`. Si falla el enum en una sola transacción, aplicar primero los `ADD VALUE` del enum y luego el resto (como en Supabase MCP).

### Producción: Vercel (web) + Railway (API)

- En **Vercel** → Variables del proyecto web: `VITE_API_URL` = URL pública del servicio API en **Railway** (pestaña *Networking* del servicio, formato `https://….up.railway.app` o dominio propio), **sin** `/` al final. Tiene que coincidir con lo que el navegador usa para llamar al backend.
- En **Railway** → Variables del servicio API: `FRONTEND_URL` como arriba (todas las URLs desde las que se abre la app) y **`ALPHACAST_API_KEY`** (ver `docs/ALPHACAST_SETUP.md`). Lista completa y variables a **borrar**: **`docs/RAILWAY_ENV.md`** (eliminar `INDEC_API_BASE_URL` si existe).

### `apps/web/.env`

| Variable | Origen típico |
|----------|----------------|
| `VITE_API_URL` | `http://localhost:3001` si el backend corre en ese puerto |
| `VITE_SUPABASE_URL` | **Misma** Project URL que `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | API → anon **public** |

---

## 6. Comprobar que funcionó

Desde la raíz del repo:

```powershell
pnpm dev
```

- La API debe arrancar sin error de **Prisma / DATABASE_URL**.
- El frontend debe cargar y el bloque de **health** debe mostrar datos si la API responde.

Si algo falla, revisá que no haya espacios ni comillas de más al pegar las keys y que `VITE_*` estén en `apps/web/.env` (Vite no lee `apps/api/.env`).

---

## 7. Prisma: `Can't reach database server` (Supabase)

La causa más habitual en **Windows** o redes **solo IPv4** no es que la base esté caída, sino la **URI “directa”** al host `db.<ref>.supabase.co`: Supabase documenta que esa conexión usa **IPv6 por defecto**; si tu PC o red no llegan por IPv6, Prisma no establece TCP y devuelve “Can’t reach”. La referencia oficial es [Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres) (apartados *Direct connection* y *Pooler session mode*).

### Qué hacer (orden recomendado)

1. **Session pooler (primera opción)**  
   En el dashboard: botón **Connect** → método **Session pooler** (Shared pooler / “Session mode”). Copiá la URI y pegala en `apps/api/.env` como `DATABASE_URL`. Usuario tipo `postgres.<project_ref>`, host tipo `aws-<n>-<región>.pooler.supabase.com` (el número y la región los muestra tu proyecto), puerto **5432**. Suele incluir `sslmode`. Esto funciona por **IPv4 e IPv6**.

2. **SSL**  
   Si armás la URI a mano, agregá `?sslmode=require` si el panel no lo incluye.

3. **Contraseña con caracteres especiales**  
   Codificá (`@` → `%40`, etc.) dentro de la URI.

4. **Puerto 5432 bloqueado en la red**  
   Si incluso el pooler falla, probá otra red o **Transaction pooler** (puerto **6543**); con Prisma + PgBouncer en modo transacción pueden hacer falta parámetros extra (`pgbouncer=true`, límites de prepared statements). Para el backend Express de PreciosYa suele bastar **Session pooler**.

5. **Variable vieja en Windows**  
   Si tenés `DATABASE_URL` en variables de entorno del sistema, este repo usa `dotenv` con `override: true` en `apps/api` para priorizar `apps/api/.env`.

### Comprobar

```powershell
pnpm --filter api db:check
```

Debería imprimir `Prisma: conexión OK`.
