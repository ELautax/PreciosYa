# 1er Examen Parcial — PreciosYa (versión actualizada junio 2026)

**Gestor de precios y márgenes con inflación para comercios pequeños en Argentina**

| Campo | Valor |
|-------|-------|
| Carrera | Analista de Sistemas |
| Materia | Modelos Estratégicos de Negocios |
| Instancia | Primer examen parcial |
| Docente | Brenda Daiana LARRETA |
| Cuatrimestre | Sexto cuatrimestre — 2026 |
| Integrante | **VILLANUEVA, Lautaro Nahuel** |

> Actualización respecto del PDF entregado con coautor: producto alineado a **PreciosYa v2 en producción** (`preciosya.vercel.app`). Pugliese ya no integra el equipo.

---

## 1. Introducción

### 1.1 Conformación de la empresa

PreciosYa es una startup de software en etapa temprana, liderada por un único fundador y sin financiamiento externo. Estructura jurídica inicial: **Monotributo**, con proyección a **SAS** al sostener ingresos recurrentes. Modelo **SaaS Freemium** que elimina la barrera económica de adopción.

### 1.2 El producto (estado junio 2026)

**No es un POS.** Es un gestor de precios, márgenes y ventas simplificado para el celular.

| Funcionalidad | Descripción |
|---------------|-------------|
| Cálculo dinámico | Costo + margen → precio de venta (redondeo a decenas) |
| IPC multi-rubro | Rubros COICOP/INDEC; aplicación masiva mensual por rubro |
| Indexar USD | Variación diaria dólar oficial **BCRA** en rubros seleccionados |
| Alertas de margen | Productos bajo el mínimo del local |
| Actualización masiva | Por % manual, aplicar IPC o aplicar USD |
| Historial | `price_history` auditable por motivo de cambio |
| Escáner de barras | Cámara móvil + catálogo Open Food Facts |
| Exportación | Lista de precios **PNG** para WhatsApp (PDF fuera de alcance v1) |
| Gestor de ventas | Registro rápido sin caja, ticket ni stock |
| PWA | App web instalable; offline limitado (caché v1) |
| Planes | FREE (30 productos, 1 local) · PRO $4.500/mes · AGENCY a medida |

**Stack:** React 19, Vite, Tailwind v4, Express, Prisma, Supabase, Railway, Vercel.

---

## 2. Necesidades, deseos y valor

Sin cambios sustanciales respecto del parcial original:

- **Necesidad:** proteger rentabilidad y saber cuánto cobrar tras cada aumento.
- **Deseo:** que calcule solo, avise del INDEC/USD, funcione en el celular con mala señal.
- **Valor:** beneficio funcional (4 h → minutos) y emocional (tranquilidad). Costo Pro $4.500 (&lt;0,4% ingresos típicos). Obstáculo principal: inercia del papel.

---

## 3. Cinco fuerzas de Porter

| Fuerza | Intensidad | Comentario 2026 |
|--------|------------|-----------------|
| Rivalidad | Baja | POS generalistas no integran IPC/USD por rubro mobile-first |
| Sustitutos | **Alta** | Papel, Excel, memoria — fuerza dominante |
| Proveedores | Baja | Railway, Supabase, APIs públicas INDEC/BCRA |
| Clientes | Media | Fragmentación; retención vía historial y catálogo |
| Nuevos entrantes | Media | Barrera: conocimiento hiperlocal + confianza |

**Conclusión:** viable; táctica Freemium + catálogo cargado como barrera de salida.

---

## 4. Estrategia genérica

**Enfoque/concentración** en pequeños comerciantes abrumados por inflación argentina.

**Mitigación 2026:** IPC por rubro, USD BCRA, escáner, gestor de ventas y PWA como diferenciadores técnicos frente a imitadores y sustitutos gratuitos.

---

## 5. Segmentación, Buyer Persona y propuesta de valor

### Segmento 1 — Kiosqueros y almaceneros (principal)
GBA e interior urbano; 35–65 años; WhatsApp + Mercado Pago; estrés inflacionario.

**Insignia 2026:** IPC por rubro + USD + alertas + escáner.

### Segmento 2 — Reventa redes (secundario)
18–40 años; sensibles al precio; export PNG.

### Buyer Persona — José «Pepe» García
47 años, kiosco Lomas de Zamora, solo celular, 2–4 h/semana remarcando.

### Mapa de empatía
Frustración, carteles tachados, grupo WhatsApp comerciantes, miedo a vender a pérdida; busca tranquilidad al cerrar el local.

### Propuesta de valor (actualizada)

Para el comerciante abrumado por la inflación, PreciosYa es el ecosistema móvil que **protege el margen** con índices oficiales (IPC INDEC por rubro y dólar BCRA), alertas antes de vender a pérdida, escáner de barras y lista PNG para WhatsApp — sin la complejidad de un POS ni facturación.

---

## 6. Plan de investigación de mercado

**Objetivo:** tiempo de remarcación, uso IPC/USD, disposición a pagar, obstáculos UX.

**Método:** entrevista semiestructurada + observación; muestra 10–15 (plan original) / **4 ejecutadas** para examen 2.

**Instrumento:** ver [anexos-examen2/GUIA_ENTREVISTAS.md](./anexos-examen2/GUIA_ENTREVISTAS.md).

---

## Anexos — Referencias

- CAME — IVM 2026
- UKRA — comunicado aumentos 2025
- INDEC — IPC 2026
- BCRA — Inclusión financiera 2025

---

*Documento de trabajo actualizado junio 2026. Desarrollo completo del 2.º parcial: [MODELO_NEGOCIOS_EXAMEN2.md](./MODELO_NEGOCIOS_EXAMEN2.md).*
