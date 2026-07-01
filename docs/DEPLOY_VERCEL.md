# Vercel — dominios PreciosYa

## App (proyecto `web`)

- **URL producción:** https://preciosya.vercel.app (alias secundario: https://preciosya-app.vercel.app)
- **APK Android:** https://preciosya-landing.vercel.app/preciosya.apk (también en la app: `/preciosya.apk` tras build). Regenerar con `node scripts/build-preciosya-apk.mjs` (copia a `apps/web/public/` y `apps/landing/`). La descarga se promociona desde la **landing** (`#descargar`), no desde el login.
- Deploy desde la **raíz del monorepo** (`.vercel/project.json` → proyecto `web`). **No** desde `apps/web/` ni con `--prebuilt` (rompe env y API).

```powershell
cd "G:\Github Clones\PreciosYa"
$env:VERCEL_OIDC_TOKEN = $null   # .env.local apunta a preciosya-landing y desvía el deploy
$env:VERCEL_ORG_ID = "team_HnVOLFFv3g4y8yeEdpAkwGsn"
$env:VERCEL_PROJECT_ID = "prj_6yj0HLVIxL3te17N36awiH5sOIFy"
npx vercel deploy --prod --yes
```

Alternativa fiable: **push a `main`** → GitHub Actions (`deploy-web-vercel`) sube el monorepo completo (~334 archivos) con `pnpm install` + `pnpm --filter web build`.

### Si el deploy CLI queda en QUEUED / tarda mucho

- **No es error de build:** el job ni siquiera arranca (sin logs en Vercel). Suele pasar en plan Hobby con varios deploys CLI seguidos.
- Cancelá deploys viejos en [Vercel → web → Deployments](https://vercel.com/elautaxs-projects/web) (estado `QUEUED`).
- **No deployar desde `apps/web`:** solo sube ~167 archivos; el `installCommand` con `cd ../..` no encuentra el monorepo y el build falla o se cuelga.
- **No usar `vercel deploy --prebuilt`:** no corre el build en Vercel; las `VITE_*` del dashboard no se inyectan y la app queda sin API/Supabase.
- Deploys exitosos vía GitHub muestran `Downloading 334 deployment files` y `pnpm install --frozen-lockfile` en la raíz.


Tras el deploy, Vercel actualiza `preciosya-app.vercel.app` y `web-rho-ten-99.vercel.app`. Si **`preciosya.vercel.app`** sigue mostrando UI vieja, reasignar el alias al URL del deploy que acaba de salir (ej. `web-xxxxx-elautaxs-projects.vercel.app`):

```bash
npx vercel alias set web-xxxxx-elautaxs-projects.vercel.app preciosya.vercel.app
```

## Landing (`preciosya-landing`)

- URL: https://preciosya-landing.vercel.app
- Blog / guías: https://preciosya-landing.vercel.app/blog/
- **Blog:** 4 guías publicadas, búsqueda en índice, RSS `/blog/feed.xml`, JSON-LD en artículos, imágenes en `assets/blog/` (ver `IMAGENES.md`).
- CTAs → **`https://preciosya.vercel.app/login?from=landing`**
- APK: sección **`#descargar`** con botón directo a **`https://preciosya-landing.vercel.app/preciosya.apk`** (`site-config.js` → `PRECIOSYA_APP_APK`); no usar la URL de la app (el rewrite SPA mandaba al login)
- Hero con shader WebGL (fallback CSS si no hay WebGL o `prefers-reduced-motion`); animaciones GSAP/ScrollTrigger + Lenis via CDN
- Secciones de conversión: barra de confianza (INDEC/BCRA), testimonios, comparativa, objeciones, CTA sticky en mobile; fondo unificado sin cortes de color entre secciones
- **Funcionalidades:** grid **4×2** (8 cards, hover Kombai); incluye **Gestor de ventas** (registro + rentabilidad)
- Plan **Agency** en `#precios`: precio a medida (sin tarifa fija); CTA `mailto:hola@preciosya.app` con asunto/cuerpo prefilled — no redirige al login
- Cards de planes en **grid de 3 columnas** (desktop) con textos acortados para evitar saltos de línea raros; sin animación de mazo
- Deploy: `cd apps/landing && npx vercel deploy --prod --yes`

### Barra de URL / Chrome en la APK (TWA)

Si la APK muestra arriba la URL de Vercel, compartir y menú de Chrome, **no está en modo TWA verificado** (caída a Custom Tabs).

**Causas habituales:**

1. **APK desactualizada** — desinstalá la app y volvé a instalar desde `https://preciosya-landing.vercel.app/preciosya.apk` (cada regeneración puede cambiar la firma).
2. **Huella SHA-256 del APK ≠ `assetlinks.json`** — `node scripts/build-preciosya-apk.mjs` actualiza APK + `apps/web/public/.well-known/assetlinks.json` → redeploy **web** + **landing**.
3. **Deployment Protection (SSO)** en el proyecto `web` — bloquea `/.well-known/assetlinks.json` (302 a login Vercel). Debe responder **200** en `preciosya.vercel.app` y `preciosya-app.vercel.app`.
4. **Host TWA** — el build usa `https://preciosya.vercel.app` con `preciosya-app.vercel.app` como origen adicional de confianza (ambos con assetlinks).

**Regenerar APK:** `node scripts/build-preciosya-apk.mjs` → copia a `apps/web/public/` y `apps/landing/` → redeploy web + landing → **reinstalar** en el celular.

**Verificar en producción:** `curl https://preciosya.vercel.app/.well-known/assetlinks.json` debe devolver JSON con `package_name: app.preciosya.twa`.


```
https://preciosya.vercel.app,https://preciosya-app.vercel.app,https://preciosya-landing.vercel.app,https://web-rho-ten-99.vercel.app
```
