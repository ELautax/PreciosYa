# Matriz de congruencia producto ↔ documentación (v3.1)

**Fuente de verdad del producto:** API Express (límites reales) + UI en producción.

| Capacidad / feature | Free (código) | Pro | Documentado en |
|---------------------|---------------|-----|----------------|
| Productos | máx. 30 | ilimitado | landing, planTiers, Manual, Word, GUIA |
| Locales | 1 | 3 | idem |
| Apply IPC / Apply USD | sí (sin `requirePlan`) | sí | landing Free, docs alineados |
| Alertas margen / PNG / escáner / historial precios | sí | sí | Free |
| Ventas: registrar | sí | sí | Free |
| Ventas: resumen/historial | **máx. 7 días** | períodos extendidos | Free 7d / Pro analytics |
| Ventas: top/estancados/estrellas/rubro | no (`requirePlan PRO`) | sí | Pro |
| Email IPC (Resend) | no | sí (scheduler) | Pro |
| Contacto | `sales@preciosya.com` | idem | landing, app, docs |
| App URL | `preciosya.vercel.app` | — | host TWA principal |
| Alias app | `preciosya-app.vercel.app` | — | origen TWA adicional (mismo proyecto Vercel web) |
| Cobro Pro | Mercado Pago **sandbox** (tesis) | — | Word, GUIA, RF-W022 |

**Corrección aplicada (jul 2026):** la landing y `planTiers` vendían IPC/USD como exclusivos Pro, pero la API ya los permite en Free. Se alineó marketing y docs al comportamiento real.
