# Vercel — dominios PreciosYa

## App (proyecto `web`)

- **URL producción:** https://preciosya.vercel.app (alias secundario: https://preciosya-app.vercel.app)
- **APK Android:** https://preciosya.vercel.app/preciosya.apk (regenerar con `node scripts/build-preciosya-apk.mjs`)
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
- CTAs → **`https://preciosya.vercel.app/login?from=landing`**
- APK: enlace directo a **`https://preciosya.vercel.app/preciosya.apk`** (no se instala PWA desde la landing)
- Deploy: `cd apps/landing && npx vercel deploy --prod --yes`

## Railway CORS

```
https://preciosya.vercel.app,https://preciosya-app.vercel.app,https://preciosya-landing.vercel.app,https://web-rho-ten-99.vercel.app
```
