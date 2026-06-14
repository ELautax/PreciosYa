# Gantt — Proyecto PreciosYa

Cronograma del desarrollo (ago 2025 – jul 2026). Ajustar fechas exactas según acta de tesis.

## Diagrama

```mermaid
gantt
  title PreciosYa — Cronograma de desarrollo
  dateFormat YYYY-MM-DD
  axisFormat %b %Y

  section Fundamentos
  Monorepo y skeleton           :done, f1, 2025-08-01, 2025-08-21
  Prisma schema y auth          :done, f2, 2025-08-15, 2025-09-05
  PricingEngine y productos     :done, f3, 2025-09-01, 2025-09-25

  section MVP v1
  IPC INDEC y bulk update       :done, m1, 2025-09-20, 2025-10-15
  Export PNG y notificaciones   :done, m2, 2025-10-01, 2025-10-25
  PWA y deploy Railway/Vercel   :done, m3, 2025-10-15, 2025-11-10
  CI GitHub Actions             :done, m4, 2025-11-01, 2025-11-15

  section v2 producto
  Rubros COICOP multi-IPC       :done, v1, 2025-11-15, 2026-01-15
  USD BCRA por rubro            :done, v2, 2026-01-01, 2026-02-28
  Landing y dominio produccion  :done, v3, 2026-02-01, 2026-03-15
  Gestor de ventas v1           :done, v4, 2026-05-15, 2026-06-15

  section Cierre tesis
  Documentacion entrega 2.1     :active, t1, 2026-06-01, 2026-07-01
  Pulido UX y landing           :active, t2, 2026-06-10, 2026-06-25
  Ensayo demo y defensa         :t3, 2026-07-01, 2026-07-15
```

## Tabla por fase

| Fase | Período | Entregables |
|------|---------|-------------|
| F1 Fundamentos | Ago–Sep 2025 | Monorepo, Prisma, Auth Google |
| F2 MVP core | Sep–Nov 2025 | Productos, IPC básico, export PNG |
| F3 Deploy | Nov 2025 | Railway, Vercel, Supabase, CI |
| F4 v2 rubros/USD | Nov 2025–Mar 2026 | COICOP, BCRA, banners aplicado |
| F5 Ventas v1 | May–Jun 2026 | sales/sale_lines, UI /sales |
| F6 Documentación | Jun–Jul 2026 | docs/entrega/, manual, UML, DER |
| F7 Defensa | Jul 2026 | Presentación oral + demo live |

## Hitos clave

| Fecha | Hito |
|-------|------|
| Nov 2025 | MVP v1 funcional en staging |
| Mar 2026 | Landing + preciosya.vercel.app |
| Jun 2026 | Gestor ventas v1 en producción |
| Jul 2026 | Entrega documentación + defensa |

## Trabajo futuro (post-tesis)

Ver [ROADMAP_TESIS.md](../ROADMAP_TESIS.md) sección v2: anular ventas, insights margen, export cierre, offline.
