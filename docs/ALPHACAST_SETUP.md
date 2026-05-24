# Alphacast — API key e IPC

Fuente principal del IPC en PreciosYa (general + 12 divisiones COICOP). Dataset: [Consumer Price Index - Grouped (5515)](https://www.alphacast.io/datasets/consumer-price-index-grouped-5515).

---

## 1. Obtener la API key

1. Entrá a [alphacast.io](https://www.alphacast.io/) e iniciá sesión.
2. En tu perfil / **Settings** copiá la clave que empieza con `ak_`.
3. Si la key se filtró en un chat o en Git, **rotala** en Alphacast y usá la nueva.

---

## 2. Local (`apps/api/.env`)

Si no tenés el archivo:

```powershell
Copy-Item "apps\api\.env.example" "apps\api\.env"
```

Abrí `apps/api/.env` y pegá **solo el valor** después del `=` (sin comillas):

```env
ALPHACAST_API_KEY=ak_tu_clave_aqui
```

Opcional (valores por defecto en el código):

```env
ALPHACAST_IPC_DATASET_ID=5515
ALPHACAST_API_BASE_URL=https://api.alphacast.io
```

Reiniciá el API (`pnpm --filter api dev`).

---

## 3. Railway (producción)

1. [Railway](https://railway.app) → proyecto **PreciosYa** → servicio **api**.
2. **Variables** → **New Variable**:
   - **Name:** `ALPHACAST_API_KEY`
   - **Value:** pegá tu `ak_…`
3. (Opcional) `ALPHACAST_IPC_DATASET_ID` = `5515`
4. Guardá y **Redeploy** el servicio api.

No subas la key a GitHub. El archivo `apps/api/.env` ya está en `.gitignore`.

---

## 4. Comprobar

Con el API en marcha y sesión admin:

- Panel **Admin** → forzar fetch IPC, o
- `POST /api/admin/ipc/force-fetch` con token de admin.

En logs deberías ver algo como:

`[ipc-fetch] IPC desde Alphacast (13 series, mes 2026-04)`

Si Alphacast devuelve **401**, probá en [dataset 5515](https://www.alphacast.io/datasets/consumer-price-index-grouped-5515) → **Download** → copiar enlace y pegarlo en:

```env
ALPHACAST_DOWNLOAD_URL=https://api.alphacast.io/datasets/5515/data?apiKey=...&format=csv
```

Si Alphacast no responde, el backend usa **Argly** solo para el IPC **general** (mismo % en todas las divisiones hasta que Alphacast vuelva). No se usa datos.gob.ar.

---

## Referencia técnica

- Descarga: `GET {ALPHACAST_API_BASE_URL}/datasets/{ALPHACAST_IPC_DATASET_ID}/data?apiKey=…&format=csv`
- Código: `apps/api/src/services/ipc-fetch/alphacast.service.ts`
- Más contexto: `docs/IPC_SOURCES.md`
