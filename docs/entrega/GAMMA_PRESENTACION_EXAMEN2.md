# PreciosYa — Modelos Estratégicos de Negocios
## Examen Parcial 2 · ACM6AP · Junio 2026
### VILLANUEVA Lautaro Nahuel · Analista de Sistemas

---

# Agenda

1. Resumen ejecutivo
2. La empresa (misión, micro y macroambiente)
3. Clientes e investigación de mercado
4. Diagnóstico estratégico (FODA)
5. Business Model Canvas
6. Viabilidad económica (MVE)
7. Marketing digital y ecosistema
8. Conclusiones

---

# El problema

- En el GBA, un kiosquero dedica **~2 h/semana** a remarcar precios tras cada remisión del proveedor
- Herramientas habituales: **papel, calculadora, Excel** — costo percibido cero
- Riesgo real: **vender a pérdida** por no actualizar a tiempo
- La inflación y el dólar obligan a remarcar con frecuencia, sin herramienta especializada

---

# Qué es PreciosYa

**Gestor de precios y márgenes mobile-first** — no es POS ni facturación

| Función clave | Beneficio |
|---|---|
| Costo + margen → precio | Cálculo automático |
| IPC INDEC por rubro (COICOP) | Ajuste oficial en un toque |
| USD BCRA por rubro | Indexación sin «a ojo» |
| Alertas de margen | Aviso antes de perder plata |
| PNG para WhatsApp | Lista lista para compartir |
| Escáner de barras | Menos fricción al cargar catálogo |
| PWA + offline limitado | Funciona desde el celular |

**Modelo:** SaaS Freemium · FREE (30 productos, 1 local) · PRO $4.500/mes · AGENCY a medida

---

# 5 Fuerzas de Porter

Mercado: software de gestión para pequeños comercios en Argentina

| Fuerza | Intensidad | Lectura |
|---|---|---|
| Rivalidad directa (POS) | **Baja** ✓ | POS genéricos, no especializados en margen + IPC móvil |
| Sustitutos (papel/Excel) | **Alta** ✗ | Competencia real; Freemium + UX tipo WhatsApp |
| Poder proveedores | **Baja** ✓ | Cloud y APIs públicas con alternativas |
| Poder clientes | **Media** | Fragmentado; retención vía catálogo + historial |
| Nuevos entrantes | **Media** | Barrera = conocimiento local + confianza |

**Conclusión:** viable. La fuerza más exigente es el **hábito manual**, no la rivalidad con otros softwares.

---

# Estrategia genérica: ENFOQUE

PreciosYa **no compite** como ERP universal ni POS de supermercado

- **100% de recursos** en kiosqueros y almaceneros abrumados por la remarcación
- Diferencial: agilidad móvil + índices oficiales (IPC por rubro, USD BCRA)
- No liderazgo en costos ni diferenciación amplia
- Posicionamiento: **herramienta de supervivencia y agilidad**, no de facturación

---

# Segmento y Buyer Persona

**Segmento principal:** kiosqueros y almaceneros del GBA e interior urbano (35–65 años)

**Pepe García**, 47 años — kiosco en Lomas de Zamora, 20 años de experiencia
- Solo usa el celular; rechaza apps pesadas
- Dolor: horas tachando carteles; teme vender a pérdida

**Segmento secundario:** revendedores por WhatsApp/Instagram (18–40 años) — valoran PNG estético

---

# Propuesta de valor

> Para el comerciante de barrio abrumado por la inflación, PreciosYa es la herramienta móvil que **protege sus ganancias** automatizando precios y márgenes con índices oficiales, alertándolo antes de vender a pérdida, permitiendo escanear productos y compartir listas por WhatsApp — **sin la complejidad de un POS**.

---

# Investigación de mercado

**Método:** 4 entrevistas en profundidad + observación en local (GBA)  
**Objetivo:** validar tiempo de remarcación, uso de IPC/USD, disposición a pagar y obstáculos

| Indicador | Resultado |
|---|---|
| Horas/semana en remarcar | **2 h promedio** (1,5–2,5) |
| Herramienta dominante | Papel / calculadora / Excel |
| Conoce IPC INDEC | 50% (vago) |
| Ajusta rubros al dólar | **100%** («a ojo») |
| Disposición a pagar | **$4.000–$7.000/mes** (~$5.500) |

**Plan Pro ($4.500)** queda **por debajo** del valor percibido → precio defendible

---

# Hallazgos clave de campo

1. El dolor es **real y recurrente** (cada remisión de proveedor)
2. El IPC existe en la cabeza, **no en la práctica** → aplicar por rubro en un toque
3. El dólar es **transversal** (100% de la muestra) → valida «Indexar USD»
4. Barrera principal: **hábito manual**, no el precio → Free + escáner + UX simple
5. MVP validado: cálculo automático, alertas, PNG y escáner con mejor recepción

*Cita E-04:* «Si la app me avisa y me calcula solo, pagaría, pero primero la probaría gratis.»

---

# FODA — síntesis

| Fortalezas | Debilidades |
|---|---|
| Nicho hiperespecífico + índices oficiales | Marca nueva, equipo de 1 persona |
| Freemium + historial (retención) | Dependencia de APIs externas |
| MVP en producción, validado en campo | Muestra cualitativa n = 4 |

| Oportunidades | Amenazas |
|---|---|
| Inflación estructural | Papel/Excel arraigados |
| Brecha en indexación USD | Resistencia tecnológica |
| Digitalización (WA, MP) | POS que agregan precios |
| Contenido SEO + gremios (UKRA, CAME) | Nuevos entrantes low-code |

**Estrategia:** FO (índices + educación) · WO (Free + blog) · FA (historial vs papel) · evitar competir como POS

---

# Business Model Canvas

**Segmentos:** kiosco/almacén (principal) · reventa redes (secundario)

**Propuesta de valor:** «Remarcar con confianza en minutos, con el margen protegido, desde el celular»

**Canales:** landing → app PWA · SEO/blog · redes · gremios · Mercado Pago

**Relaciones:** Free = autoservicio · Pro = automatizado · Agency = asistencia personal

**Ingresos:** Freemium · Pro $4.500/mes · Agency a medida

**Recursos clave:** PricingEngine, índices, PWA, fundador full-stack

**Costos:** ~$40.000 ARS/mes (cloud) · bootstrap sin sueldo fundador

---

# Viabilidad económica

**Inversión inicial:** ~$100.000 ARS (dominio + setup cloud)

**Punto de equilibrio:**
- CF conservador $40.000/mes → **10 suscriptores Pro**
- CF austero $25.000/mes → **6 Pro**
- Embudo mínimo: ~**500 usuarios Free** (conversión 2%)

**Margen por Pro:** $4.500 − $158 (MP) ≈ **$4.342/mes**

**Etapa actual (jun. 2026):** pre-MVE comercial — cuello de botella = **escala**, no margen unitario  
**Plazo estimado equilibrio:** 12–18 meses post-lanzamiento con cobro real

---

# Marketing digital — 4P

| P | PreciosYa |
|---|---|
| **Producto** | PWA: margen, IPC/USD, alertas, PNG, escáner — no POS |
| **Precio** | Free + Pro $4.500 (< WTP campo) |
| **Plaza** | 100% digital: landing → app; cobro MP |
| **Promoción** | Contenido educativo, SEO, redes, grupos comerciantes — sin pauta en fase tesis |

**Crecimiento:** penetración de mercado (mismo producto, más kioscos GBA vía orgánico)

---

# Ecosistema digital

**Centro:** sitio propio (landing + app + blog)

```
Atracción          →  Landing  →  Blog/SEO  →  App PWA  →  Retención/Pro
IG · WA · SEO · Ads     explica      educa       valor      notif · historial · MP
```

**Métricas:** sesiones landing · registros OAuth · activación Free · conversión Pro · tiempo en blog

**Piezas:** post descubrimiento IG/WA · carrusel «no es POS» · blog SEO (8 notas planificadas)

---

# Conclusiones

1. **Problema validado** en campo: remarcación manual + riesgo de margen
2. **Producto alineado** con necesidades reales (IPC, USD, alertas, PNG)
3. **Estrategia de enfoque** coherente con Porter, FODA y Canvas
4. **Precio Pro defendible** frente a disposición a pagar observada
5. **Viabilidad técnica y económica** a escala reducida (6–10 Pro)
6. **Desafío principal:** adopción frente al hábito manual → Free + UX + contenido

---

# Gracias

**PreciosYa** — preciosya-landing.vercel.app · preciosya.vercel.app

VILLANUEVA Lautaro Nahuel  
Modelos Estratégicos de Negocios · Da Vinci · 2026

*¿Preguntas?*
