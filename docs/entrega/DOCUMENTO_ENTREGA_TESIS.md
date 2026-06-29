# PreciosYa — Documento de entrega tesis

**Integrante:** VILLANUEVA, Lautaro Nahuel  
**Escuela:** Escuela Multimedial Da Vinci · Analista de Sistemas · 2026  

> **Exportación:** Unir con [CARATULA_TESIS.md](./CARATULA_TESIS.md) como primera página.  
> Comando sugerido: `pandoc CARATULA_TESIS.md DOCUMENTO_ENTREGA_TESIS.md -o PreciosYa_Entrega_Tesis.docx`

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Material documental 2.1](#2-material-documental-21)
   - 2.1 [Manual de usuario](#21-manual-de-usuario)
   - 2.2 [Casos de uso](#22-casos-de-uso)
   - 2.3 [Casos de prueba](#23-casos-de-prueba)
   - 2.4 [UML](#24-uml)
   - 2.5 [Requisitos funcionales Web](#25-requisitos-funcionales-web)
   - 2.6 [Requisitos funcionales APK](#26-requisitos-funcionales-apk)
   - 2.7 [DER](#27-der)
   - 2.8 [Diseño de arquitectura](#28-diseño-de-arquitectura)
   - 2.9 [Diagrama de componentes](#29-diagrama-de-componentes)
   - 2.10 [Gantt](#210-gantt)
3. [Modelo de negocios](#3-modelo-de-negocios)
4. [Trazabilidad RF → CU → CP](#4-trazabilidad-rf--cu--cp)
5. [Anexos y presentación](#5-anexos-y-presentación)

---

## 1. Resumen ejecutivo

**PreciosYa** es una plataforma SaaS Freemium para comercios minoristas argentinos (kioscos, almacenes, dietéticas). Resuelve el problema de la **remarcación manual** de precios en un contexto inflacionario: el comerciante dedica horas semanales a recalcular costos y márgenes con papel, calculadora o Excel, con riesgo de vender a pérdida.

**Qué no es:** POS, facturación ni ERP. Es un **gestor de precios y márgenes mobile-first**.

**Qué hace hoy (junio 2026):**

- Calcula precio de venta desde costo + margen (PricingEngine).
- Aplica **IPC INDEC por rubro** (divisiones COICOP) y **dólar oficial BCRA** en rubros indexados.
- Alerta cuando el margen cae bajo el mínimo del local.
- Escanea códigos de barras; exporta listas **PNG** para WhatsApp.
- Registra ventas con snapshot de rentabilidad (gestor lite, sin caja ni stock).
- Opera como **PWA** en producción con APK Android (TWA).

**URLs:** App `preciosya.vercel.app` · Landing `preciosya-landing.vercel.app` · API Railway.

**Planes:** FREE (30 productos, 1 local) · PRO ($4.500/mes) · AGENCY (a medida).

**Validación de negocio:** 4 entrevistas en GBA confirman dolor de remarcación, uso del dólar «a ojo» y disposición a pagar $4.000–$7.000/mes. Estrategia de **enfoque** en nicho hiperlocal; viabilidad económica con ~10 suscriptores Pro.

---

## 2. Material documental 2.1

Checklist de entrega académica. Estado general: **Completo** (fuente en Markdown; exportable a PDF/Word).

| # | Documento | Estado | Archivo fuente |
|---|-----------|--------|----------------|
| 1 | Manual de usuario | Completo | [MANUAL_USUARIO.md](./MANUAL_USUARIO.md) |
| 2 | Casos de uso | Completo | [CASOS_DE_USO.md](./CASOS_DE_USO.md) |
| 3 | Casos de prueba | Completo | [CASOS_DE_PRUEBA_FORMAL.md](./CASOS_DE_PRUEBA_FORMAL.md) |
| 4 | UML | Completo | [UML.md](./UML.md) |
| 5 | Requisitos funcionales Web | Completo | [REQUISITOS_FUNCIONALES_WEB.md](./REQUISITOS_FUNCIONALES_WEB.md) |
| 6 | Requisitos funcionales APK | Completo | [REQUISITOS_FUNCIONALES_APK.md](./REQUISITOS_FUNCIONALES_APK.md) |
| 7 | DER | Completo | [DER.md](./DER.md) |
| 8 | Diseño de arquitectura | Completo | [DISENO_ARQUITECTURA.md](./DISENO_ARQUITECTURA.md) |
| 9 | Diagrama de componentes | Completo | [DIAGRAMA_COMPONENTES.md](./DIAGRAMA_COMPONENTES.md) |
| 10 | Gantt | Completo | [GANTT.md](./GANTT.md) |

---

### 2.1 Manual de usuario

**Documento:** Manual de usuario — PreciosYa v1.0

**Descripción:** Guía operativa para el comerciante: instalación PWA/APK, primeros pasos, navegación, módulos (productos, rubros, índices, ventas, export), planes y solución de problemas.

**Estado:** Completo

**Archivo fuente:** [MANUAL_USUARIO.md](./MANUAL_USUARIO.md)

**Resumen:** Cubre login Google, creación de local, alta de productos con escáner, aplicación de IPC/USD, alertas de margen, export PNG, registro de ventas y límites Free vs Pro. Incluye matriz pantalla ↔ función y glosario (IPC, margen, rubro COICOP).

**Trazabilidad:** RF-W001 a RF-W061 · pantallas `/dashboard`, `/products`, `/sales`, `/settings`.

---

### 2.2 Casos de uso

**Documento:** Casos de uso — PreciosYa

**Descripción:** Especificación funcional por actores (Comerciante, Administrador, Sistemas externos) con diagrama general y detalle por CU.

**Estado:** Completo

**Archivo fuente:** [CASOS_DE_USO.md](./CASOS_DE_USO.md)

**Resumen:** 18 casos de uso desde CU-01 (Login) hasta CU-18 (APK TWA). Incluye gestión de catálogo, aplicación IPC/USD, ventas, export PNG, notificaciones y panel admin. Cada CU define precondiciones, flujo principal y postcondiciones.

**Trazabilidad:** Base para RF-W/RF-A y casos de prueba CP-XX.

---

### 2.3 Casos de prueba

**Documento:** Casos de prueba — formato formal

**Descripción:** 27 casos documentados al estilo académico (bloques con descripción, pasos, resultado esperado/real, prerrequisitos, categoría, autor, automatización, aprobación).

**Estado:** Completo

**Archivo fuente:** [CASOS_DE_PRUEBA_FORMAL.md](./CASOS_DE_PRUEBA_FORMAL.md)  
**Referencia demo:** [CASOS_DE_PRUEBA.md](./CASOS_DE_PRUEBA.md) (tabla compacta + suite 5–7 min)

**Resumen:** CP-01 a CP-12 cubren API (auth, productos, ownership, realtime, scheduler IPC, export, admin). CP-13 a CP-27 cubren UI manual, ventas, planes, APK. Suite demo tesis: login → producto → IPC → venta → resumen → PNG.

**Trazabilidad:** Cada CP referencia CU-XX y RF-W/RF-A.

---

### 2.4 UML

**Documento:** Diagramas UML (Mermaid)

**Descripción:** Casos de uso resumidos, diagramas de secuencia (login, crear producto, aplicar IPC, registrar venta), diagrama de clases simplificado y despliegue.

**Estado:** Completo

**Archivo fuente:** [UML.md](./UML.md)

**Resumen:** Secuencias documentan interacción Frontend ↔ API ↔ Supabase/Prisma. Clases centrales: User, Local, Product, PriceHistory, EconomicIndex, Sale. Exportable a PNG vía mermaid.live.

**Trazabilidad:** Alineado con CU-01, CU-04, CU-08, CU-12.

---

### 2.5 Requisitos funcionales Web

**Documento:** Requisitos funcionales — Web PWA

**Descripción:** Catálogo RF-W001 a RF-W070 con prioridad Must/Should/Won't y criterios de aceptación.

**Estado:** Completo

**Archivo fuente:** [REQUISITOS_FUNCIONALES_WEB.md](./REQUISITOS_FUNCIONALES_WEB.md)

**Resumen:** Módulos auth, locales, rubros COICOP, productos, índices IPC/USD, bulk update, ventas (Free 7 días / Pro 30-90), export PNG, notificaciones, planes y admin. PricingEngine en backend; frontend solo preview.

**Trazabilidad:** Origen de casos de uso y pruebas.

---

### 2.6 Requisitos funcionales APK

**Documento:** Requisitos funcionales — APK (TWA)

**Descripción:** RF-A001 a RF-A010 para contenedor Android Trusted Web Activity.

**Estado:** Completo

**Archivo fuente:** [REQUISITOS_FUNCIONALES_APK.md](./REQUISITOS_FUNCIONALES_APK.md)

**Resumen:** APK no es app nativa; abre la misma PWA en producción. Requisitos: descarga desde landing, instalación Android 8+, paridad funcional, permiso cámara, assetlinks.json. Push nativo y offline ventas fuera de v1.

**Trazabilidad:** CU-18 · CP-25 a CP-27.

---

### 2.7 DER

**Documento:** Diagrama Entidad-Relación

**Descripción:** Modelo de datos PostgreSQL vía Prisma: 9 tablas principales + enums.

**Estado:** Completo

**Archivo fuente:** [DER.md](./DER.md) · Schema: `apps/api/prisma/schema.prisma`

**Resumen:** Entidades users, locals, categories, products, price_history, economic_indices, notifications, subscriptions, price_lists, sales/sale_lines. Relaciones con cascada y triggers de historial de precios. Índices en product_id, local_id, type+period.

**Trazabilidad:** Base de diseño API y servicios.

---

### 2.8 Diseño de arquitectura

**Documento:** Diseño de arquitectura (C4)

**Descripción:** Contexto, contenedores, componentes backend y decisiones (No RLS, JWT, cron índices).

**Estado:** Completo

**Archivo fuente:** [DISENO_ARQUITECTURA.md](./DISENO_ARQUITECTURA.md)

**Resumen:** Monorepo pnpm: `apps/web` (React PWA), `apps/api` (Express + Prisma), `packages/shared` (PricingEngine). Deploy Vercel + Railway + Supabase. Auth Google vía Supabase; negocio solo por REST API.

**Trazabilidad:** Complementa diagrama de componentes.

---

### 2.9 Diagrama de componentes

**Documento:** Diagrama de componentes

**Descripción:** Módulos frontend, capas API (routes → controllers → services), jobs scheduler, integraciones externas.

**Estado:** Completo

**Archivo fuente:** [DIAGRAMA_COMPONENTES.md](./DIAGRAMA_COMPONENTES.md)

**Resumen:** Frontend: pages, hooks TanStack Query, AuthContext, export html2canvas. Backend: product.service, economic-index.service, ipc-fetch/, sales, notification, export. Jobs: IPC mensual + BCRA diario 03:30 AR.

**Trazabilidad:** Implementación de RF-W y CU.

---

### 2.10 Gantt

**Documento:** Cronograma Gantt

**Descripción:** Planificación ago 2025 – jul 2026 con fases, hitos y diagrama Mermaid.

**Estado:** Completo

**Archivo fuente:** [GANTT.md](./GANTT.md)

**Resumen:** Fases: fundamentos, MVP v1, deploy, v2 rubros/USD, gestor ventas, documentación 2.1, ensayo defensa. Hitos: producción nov 2025, landing mar 2026, ventas v1 jun 2026.

**Trazabilidad:** Roadmap tesis y entrega documental.

---

## 3. Modelo de negocios

Síntesis del examen parcial 2 ([MODELO_NEGOCIOS_EXAMEN2.md](./MODELO_NEGOCIOS_EXAMEN2.md)). Desarrollo completo en PDF entregado y anexos en `anexos-examen2/`.

### 3.1 Empresa y estrategia

**Misión:** Proteger la rentabilidad del comercio minorista argentino con tecnología mobile-first e índices oficiales.

**Estrategia genérica:** **Enfoque/concentración** — 100% en kiosqueros y almaceneros abrumados por la remarcación; no compite como POS ni ERP.

**5 Fuerzas de Porter (síntesis):** Rivalidad directa baja; **sustitutos (papel/Excel) alta**; proveedores baja; clientes media; nuevos entrantes media. Viabilidad estratégica confirmada.

### 3.2 Clientes

**Buyer Persona:** José «Pepe» García, 47 años, kiosco Lomas de Zamora, solo celular, 2 h/semana remarcando.

**Investigación:** n = 4 entrevistas GBA. Promedio 2 h/semana remarcación; 100% ajusta rubros al dólar «a ojo»; disposición a pagar $4.000–$7.000/mes. Plan Pro $4.500 queda por debajo del WTP.

**Propuesta de valor:** Remarcar con confianza en minutos, margen protegido, desde el celular, con IPC/USD oficiales y alertas — sin complejidad de facturación.

### 3.3 FODA y Canvas

**FODA:** Fortalezas (nicho + índices + Freemium); debilidades (marca nueva, equipo de 1); oportunidades (inflación, SEO, gremios); amenazas (hábito manual, POS genéricos).

**Canvas:** Segmentos kiosco + reventa redes; ingresos Pro $4.500 + Agency; canales landing/app/blog/redes; socios INDEC/BCRA, MP, cloud.

### 3.4 Viabilidad y marketing

**MVE:** 10 suscriptores Pro ≈ equilibrio operativo (~$40.000 CF/mes). Inversión inicial ~$100.000 ARS.

**Marketing:** 4P Freemium; ecosistema owned-first (landing → app → retención); blog SEO; piezas IG/WA. Diagramas: `porter-diagram-presentacion.html`, `foda-presentacion.html`, `canvas-presentacion.html`, `ecosistema-presentacion.html`, `buyer-persona-presentacion.html`.

---

## 4. Trazabilidad RF → CU → CP

```
RF-W / RF-A  →  Casos de uso (CU)  →  Casos de prueba (CP)
```

| Módulo | RF ejemplo | CU | CP ejemplo |
|--------|------------|-----|------------|
| Auth | RF-W001 | CU-01 | CP-01, CP-13 |
| Productos | RF-W020 | CU-04 | CP-04, CP-15 |
| Índices | RF-W031 | CU-08 | CP-08, CP-18 |
| Ventas | RF-W050 | CU-12 | CP-21 |
| Export | RF-W040 | CU-14 | CP-10, CP-23 |
| APK | RF-A001 | CU-18 | CP-25 |

Tests automatizados: `packages/shared/src/__tests__/`, `apps/api/src/**/*.test.ts`.

---

## 5. Anexos y presentación

### 5.1 Anexos técnicos y académicos

| Anexo | Archivo |
|-------|---------|
| Modelo negocios completo | [MODELO_NEGOCIOS_EXAMEN2.md](./MODELO_NEGOCIOS_EXAMEN2.md) |
| Guía entrevistas | [anexos-examen2/GUIA_ENTREVISTAS.md](./anexos-examen2/GUIA_ENTREVISTAS.md) |
| Síntesis campo | [anexos-examen2/SINTESIS_ENTREVISTAS.md](./anexos-examen2/SINTESIS_ENTREVISTAS.md) |
| Costos y viabilidad | [anexos-examen2/COSTOS_VIABILIDAD.md](./anexos-examen2/COSTOS_VIABILIDAD.md) |
| Piezas marketing | [anexos-examen2/PIEZAS_CONTENIDO.md](./anexos-examen2/PIEZAS_CONTENIDO.md) |
| Blog nota 1 | [anexos-examen2/BLOG_PRIMERA_NOTA.md](./anexos-examen2/BLOG_PRIMERA_NOTA.md) |
| Bibliografía | [anexos-examen2/BIBLIOGRAFIA.md](./anexos-examen2/BIBLIOGRAFIA.md) |

### 5.2 Presentación HTML

Slide deck unificado: [presentacion-tesis.html](./presentacion-tesis.html) (1280×720, export PDF por slide).

Diagramas individuales en `docs/entrega/*-presentacion.html`.

### 5.3 Demo en vivo

Checklist pre-defensa: [CHECKLIST_DEMO.md](./CHECKLIST_DEMO.md).

---

*Documento generado junio 2026 — PreciosYa v2 en producción.*
