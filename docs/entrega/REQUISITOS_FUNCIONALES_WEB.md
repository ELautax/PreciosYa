# Requisitos funcionales — Web (PreciosYa)

**Versión:** 1.0 · **Plataforma:** PWA React (`apps/web`) + API REST  
**Alcance:** Entregable v1 — junio 2026

## Leyenda

| Prioridad | Significado |
|-----------|-------------|
| **Must** | Obligatorio para v1 / demo tesis |
| **Should** | Deseable; parcial o plan Free limitado |
| **Won't v1** | Fuera de alcance (ver v2 en ROADMAP_TESIS) |

---

## Autenticación y cuenta

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-W001 | Login con Google OAuth vía Supabase | Must | Usuario autenticado redirige a `/dashboard`; sin sesión → `/login` |
| RF-W002 | Perfil de usuario (`GET /api/auth/me`) | Must | Muestra nombre, plan (Free/Pro/Agency), badge Admin si aplica |
| RF-W003 | Cierre de sesión | Must | Botón fijo en sidebar / menú Más; invalida sesión Supabase |

## Locales y rubros

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-W010 | CRUD locales (límite por plan) | Must | Free: máx. 1; Pro: 3; Agency: ilimitado; API retorna 403 si excede |
| RF-W011 | Selector de local activo | Must | Persiste en UI; filtra productos, IPC, ventas |
| RF-W012 | Activar rubros COICOP predefinidos | Must | Sin crear rubros custom; toggle activo/inactivo |
| RF-W013 | Indexar rubro en USD BCRA | Must | `PATCH /api/categories/:id` con `indexByUsd`; excluido de apply-ipc |

## Productos y precios

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-W020 | Alta/edición/baja lógica de productos | Must | Precio venta calculado en backend; límite 30 productos Free |
| RF-W021 | Escáner código de barras (móvil) | Must | Cámara detecta EAN; autocompletado si existe en catálogo |
| RF-W022 | Badge estado margen (OK/WARNING/LOW) | Must | Visible en listado; alerta si margen < mínimo del local |
| RF-W023 | Importación CSV productos | Should | Modal import; validación Zod en API |

## Índices económicos

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-W030 | Consultar IPC y USD latest | Must | Banner/dashboard muestra % IPC mes y cotización USD |
| RF-W031 | Aplicar IPC por local | Must | Excluye rubros USD; actualiza costos; registra historial |
| RF-W032 | Aplicar variación USD BCRA | Must | Solo rubros indexados USD; banner pendiente/aplicado |
| RF-W033 | Actualización masiva por % | Must | Por local y rubro opcional |
| RF-W034 | Historial IPC 12 meses | Should | Gráfico en `/history` |

## Exportación y notificaciones

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-W040 | Export lista precios PNG | Must | html2canvas + upload Storage; compartir/descargar |
| RF-W041 | Centro de notificaciones | Must | IPC nuevo, alerta margen, USD fuerte; Realtime Supabase |
| RF-W042 | Export PDF | Won't v1 | Planificado v2 |

## Gestor de ventas

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-W050 | Registrar venta (N líneas, 1 POST) | Must | Snapshots costo/precio; `soldAt` editable |
| RF-W051 | Resumen KPIs ventas | Must | Free: hoy + 7d; Pro: períodos extendidos + ganancia |
| RF-W052 | Historial ventas paginado | Must | Free: máx. 7 días en API |
| RF-W053 | Análisis Pro (top, estancados, etc.) | Should | `requirePlan(PRO)`; CTA upgrade en Free |
| RF-W054 | Anular/editar venta | Won't v1 | v2 |

## Planes y administración

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-W060 | Límites plan en API | Must | product.service / local.service enforcement |
| RF-W061 | Modal comparativa planes | Must | Settings → Mejorar/Gestionar plan |
| RF-W062 | Panel admin (IPC manual, usuarios) | Should | Solo `is_admin`; ruta `/admin` |
| RF-W063 | Suscripción Mercado Pago | Won't v1 | Manual vía mailto |

## No funcionales (Web)

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-W090 | Mobile-first responsive | Must | Bottom nav, safe-area, modales bottom-sheet |
| RF-W091 | PWA instalable | Must | Manifest + service worker; offline lectura limitada |
| RF-W092 | JWT en todas las rutas `/api/*` | Must | 401 sin token; CORS producción Vercel |
| RF-W093 | TZ Argentina en KPIs ventas | Must | Medianoche AR para “hoy” |
