# Vercel — dominios PreciosYa

## App (proyecto `web`)

- **URL producción:** https://preciosya-app.vercel.app
- **APK Android:** https://preciosya-app.vercel.app/preciosya.apk (regenerar con `node scripts/build-preciosya-apk.mjs`)
- Deploy desde la raíz del monorepo (`.vercel/project.json`):

```bash
npx vercel deploy --prod --yes
```

## Landing (`preciosya-landing`)

- URL: https://preciosya-landing.vercel.app
- CTAs → **`https://preciosya-app.vercel.app/login?from=landing`**
- APK: enlace directo a **`https://preciosya-app.vercel.app/preciosya.apk`** (no se instala PWA desde la landing)
- Deploy: `cd apps/landing && npx vercel deploy --prod --yes`

## Railway CORS

```
https://preciosya-app.vercel.app,https://preciosya-landing.vercel.app,https://web-rho-ten-99.vercel.app
```
