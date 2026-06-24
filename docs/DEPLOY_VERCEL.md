# Vercel — dominios PreciosYa

## App (proyecto `web`)

- **URL producción:** https://preciosya.vercel.app (alias secundario: https://preciosya-app.vercel.app)
- **APK Android:** https://preciosya-landing.vercel.app/preciosya.apk (también en la app: `/preciosya.apk` tras build). Regenerar con `node scripts/build-preciosya-apk.mjs` (copia a `apps/web/public/` y `apps/landing/`). La descarga se promociona desde la **landing** (`#descargar`), no desde el login.
- Deploy desde la raíz del monorepo (`.vercel/project.json`):

```bash
npx vercel deploy --prod --yes
```

Tras el deploy, Vercel actualiza `preciosya-app.vercel.app` y `web-rho-ten-99.vercel.app`. Si **`preciosya.vercel.app`** sigue mostrando UI vieja, reasignar el alias al URL del deploy que acaba de salir (ej. `web-xxxxx-elautaxs-projects.vercel.app`):

```bash
npx vercel alias set web-xxxxx-elautaxs-projects.vercel.app preciosya.vercel.app
```

## Landing (`preciosya-landing`)

- URL: https://preciosya-landing.vercel.app
- Blog / guías: https://preciosya-landing.vercel.app/blog/
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

1. **Deployment Protection (SSO) en `preciosya.vercel.app`** — bloquea `/.well-known/assetlinks.json` (redirect 302 a Vercel login). El dominio **`preciosya-app.vercel.app`** no debe tener SSO; el TWA debe apuntar ahí (`scripts/build-preciosya-apk.mjs` default).
2. **Huella SHA-256 del APK ≠ `assetlinks.json`** — regenerar APK y commitear el `assetlinks.json` que genera PWABuilder; el usuario debe **reinstalar** la APK.
3. **Regenerar APK:** `node scripts/build-preciosya-apk.mjs` → copia a `apps/web/public/` y `apps/landing/` → redeploy web + landing.

**Vercel:** en proyecto `web` → Settings → Deployment Protection → desactivar autenticación en **Production** (o excluir rutas públicas), si querés usar `preciosya.vercel.app` como host del TWA.


```
https://preciosya.vercel.app,https://preciosya-app.vercel.app,https://preciosya-landing.vercel.app,https://web-rho-ten-99.vercel.app
```
