# Checklist pre-demo — Defensa PreciosYa

Ejecutar **48 h antes** y **el día de la presentación**.

## Verificación automática (14 jun 2026)

| Ítem | Resultado |
|------|-----------|
| `GET /health` | OK — `status: ok`, `version: 0.2.0`, `gitCommit: 61a7d5f`, `ipcSource: alphacast` |
| Tablas `sales` / `sale_lines` | OK — existen en Supabase (migración aplicada) |
| `pnpm --filter web build` | OK — compila sin errores tras fixes v1.1 |
| Landing alineada | OK — `preciosya.vercel.app`, Free 7d, Pro mailto, Agency bullets |
| Docs `docs/entrega/` | OK — 10 entregables + checklist + README índice |
| Redeploy web/landing | **Pendiente** — cambios locales sin push; ver sección Deploy |

### Deploy pendiente

Los fixes v1.1 (UX + landing + docs) están en working tree. Para producción:

1. Commit + push a `main` (dispara `.github/workflows/deploy.yml`), **o**
2. `npx vercel deploy --prod` en `apps/web` y `apps/landing` con token Vercel.

La API en Railway no requiere redeploy para estos cambios (solo front + docs).

---

## Infraestructura

- [ ] `GET https://api-production-3626.up.railway.app/health` → `status: ok`, `gitCommit` reciente
- [ ] `https://preciosya.vercel.app` carga última versión (Ctrl+F5)
- [ ] Login Google funciona en URL de demo (no localhost)
- [ ] `FRONTEND_URL` en Railway incluye dominio Vercel usado

## Base de datos

- [ ] `GET /api/locals` devuelve al menos 1 local
- [ ] Crear producto de prueba OK
- [ ] Tablas `sales` / `sale_lines` existen (migración aplicada)

## Datos demo

- [ ] Local demo con nombre reconocible (ej. "Kiosco Demo")
- [ ] 3–5 productos en rubros distintos (1 rubro USD si aplica)
- [ ] Al menos 1 venta registrada (backup) o listo para registrar en vivo
- [ ] IPC del mes visible en dashboard (o plan B: admin carga manual)

## Alphacast / IPC

- [ ] `ALPHACAST_API_KEY` configurada en Railway **o**
- [ ] Admin puede cargar IPC manual con % distintos por división

## Dispositivo demo

- [ ] Celular cargado; cámara probada para escáner
- [ ] Export PNG probado una vez
- [ ] APK instalada (opcional) desde landing
- [ ] Screenshots backup si falla red en aula

## Guión 5–7 min

1. [ ] Login → Dashboard (badge plan visible)
2. [ ] Producto + margen calculado
3. [ ] Rubro IPC vs USD (explicar 30 s)
4. [ ] Apply IPC o mostrar banner ya aplicado
5. [ ] Ventas → Registrar 2 ítems → Resumen KPIs
6. [ ] Export PNG (opcional si hay tiempo)
7. [ ] Slide cierre: limitaciones + v2 (ROADMAP_TESIS)

## Documentación entregada

- [ ] 10 archivos en `docs/entrega/` exportados a PDF/Word
- [ ] Trazabilidad RF → CU → CP verificada
- [ ] Limitaciones honestas en oral (no POS, ventas online, TWA)

## Plan B

| Fallo | Acción |
|-------|--------|
| OAuth caído | Screenshots + video corto pregrabado |
| IPC plano | Explicar fallback; mostrar historial manual |
| Escáner falla | Búsqueda manual por nombre |
| API 500 | Mostrar health log; usar rama backup deploy |

---

*Última revisión: junio 2026*
