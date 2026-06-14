# Documentación PreciosYa

Índice de documentación del proyecto. Se actualiza junto con el producto (presentación ~2 meses).

> **Regla del repo:** cualquier agente o desarrollador que cambie funcionalidad debe actualizar los `.md` afectados en la **misma sesión** que el código. Está definido en [`.cursorrules`](../.cursorrules) (sección **2.1** y regla **12** en sección 17).

| Documento | Audiencia | Contenido |
|-----------|-----------|-----------|
| [PRECIOSYA.md](./PRECIOSYA.md) | Presentación / stakeholders | Qué es, problema, solución, módulos, planes |
| [entrega/README.md](./entrega/README.md) | **Tesis — sección 2.1** | Manual, CU, CP, UML, RF Web/APK, DER, arquitectura, Gantt |
| [ROADMAP_TESIS.md](./ROADMAP_TESIS.md) | Defensa oral | Alcance v1, v2, demo sugerida |
| [ROADMAP_TESIS.md](./ROADMAP_TESIS.md) | Tesis / defensa | Alcance v1 congelado, v1.1, v2 propuesto, demo sugerida |
| [GUIA_USUARIO.md](./GUIA_USUARIO.md) | Comerciantes | Flujos: productos, rubros, IPC, USD, exportar |
| [INDICES_Y_PRECIOS.md](./INDICES_Y_PRECIOS.md) | Producto + dev | Modelo IPC vs USD, rubros, aplicación masiva |
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Desarrollo | Monorepo, API, DB, deploy |
| [IPC_SOURCES.md](./IPC_SOURCES.md) | Ops | Alphacast, Argly, carga manual |
| [ALPHACAST_SETUP.md](./ALPHACAST_SETUP.md) | Ops | API key y dataset IPC |
| [RAILWAY_ENV.md](./RAILWAY_ENV.md) | Ops | Variables API en Railway |
| [SUPABASE_ENV.md](./SUPABASE_ENV.md) | Ops | Auth y Postgres |
| [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) | Ops | Front en Vercel |

## URLs de referencia (producción)

- Web: https://preciosya.vercel.app
- API: https://api-production-3626.up.railway.app
- Landing: https://preciosya-landing.vercel.app

## Incidencias conocidas

- [FIX_MIGRACIONES_202606.md](./FIX_MIGRACIONES_202606.md) — locales “desaparecidos” / error al crear producto (migraciones pendientes).

## Comandos rápidos

```bash
pnpm --filter api run db:deploy    # migraciones en producción
pnpm --filter api run typecheck
pnpm --filter web run build
npx vercel deploy --prod --yes     # desde raíz del monorepo
```
