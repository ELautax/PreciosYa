# Vercel — dominios PreciosYa

## App (proyecto `web`)

1. [Vercel Dashboard → web](https://vercel.com/elautaxs-projects/web) → **Settings → Domains**
2. Agregar **`preciosya.vercel.app`** como dominio de producción del proyecto `web`.
3. Si el dominio está en otro proyecto, eliminarlo allí primero o transferirlo.
4. Opcional: redirect de `web-rho-ten-99.vercel.app` → `preciosya.vercel.app`.

Deploy desde la raíz del monorepo (`.vercel/project.json`):

```bash
npx vercel deploy --prod --yes
```

## Landing (`preciosya-landing`)

- URL: https://preciosya-landing.vercel.app
- Todos los CTAs deben apuntar a **`https://preciosya.vercel.app/login?from=landing`**
- Deploy: `cd apps/landing && npx vercel deploy --prod --yes` (proyecto `landing` o `preciosya-landing`)

## Railway CORS

Variable `FRONTEND_URL` (comma-separated):

```
https://preciosya.vercel.app,https://web-rho-ten-99.vercel.app,https://preciosya-landing.vercel.app
```

## Build web

`apps/web/vercel.json` usa `installCommand` desde la raíz del monorepo (`cd ../.. && pnpm install`).
