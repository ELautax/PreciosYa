# Costos, ingresos y viabilidad económica — PreciosYa

**Moneda:** ARS (valores estimados junio 2026)  
**Horizonte:** operación bootstrap, sin salarios de fundador

---

## 1. Estructura de ingresos

| Plan | Precio | Límite clave | Canal de cobro |
|------|--------|--------------|----------------|
| FREE | $0 | 30 productos, 1 local, ventas 7 días | — |
| PRO | **$4.500/mes** | Productos ilimitados, 3 locales, IPC/USD completo, ventas dashboard | Mercado Pago Suscripciones (sandbox tesis; Admin para demo) |
| AGENCY | A medida | Multi-local ilimitado | Contacto comercial (mailto) |

**Supuesto de conversión (año 1):** 2% FREE → PRO sobre base de 500 usuarios registrados → 10 Pro activos.

**Ingreso mensual proyectado (año 1):** 10 × $4.500 = **$45.000 ARS/mes**

---

## 2. Costos fijos mensuales (infraestructura)

| Rubro | Proveedor | Costo estimado/mes |
|-------|-----------|-------------------|
| API + cron | Railway | USD 5–15 (~$8.000–$15.000) |
| Base de datos + Auth + Storage | Supabase (free/pro) | $0–$12.000 |
| Frontend app + landing | Vercel (hobby/pro) | $0–$5.000 |
| Dominio | — | ~$2.000 |
| Emails IPC (Pro) | Resend | $0–$3.000 |
| IPC datos | Alphacast API | incluido en plan dev |
| Mercado Pago | Comisión solo sobre cobros reales | ~3,5% sobre Pro cobrado |
| **Total infra** | | **~$25.000–$40.000/mes** |

**Costo fijo adoptado para cálculos:** **$40.000 ARS/mes** (escenario conservador con Supabase/Railway en tier pago).

---

## 3. Costos variables

| Concepto | Estimación |
|----------|------------|
| Comisión MP por suscripción Pro | $157,5 por usuario Pro ($4.500 × 3,5%) |
| Almacenamiento PNG listas | marginal &lt; $500/mes hasta 1.000 exports |

---

## 4. Punto de equilibrio

**Fórmula:** CF / (Precio unitario − CV unitario)

- CF = $40.000  
- Precio Pro = $4.500  
- CV ≈ $158 (comisión MP)  
- **Margen de contribución** ≈ $4.342 por suscriptor Pro  

**Punto de equilibrio:** 40.000 / 4.342 ≈ **9,2 → 10 suscriptores Pro**

Con **10 clientes Pro** el proyecto cubre infraestructura; el fundador aún no retribuye salario (bootstrap típico de startup en etapa temprana).

---

## 5. Mínimo viable económico (MVE)

| Concepto | Valor |
|----------|-------|
| MVE (suscriptores Pro) | **10** |
| Ingreso MVE | $45.000/mes |
| Tiempo estimado para alcanzar MVE | 12–18 meses post-lanzamiento público |
| Supuesto clave | 500 usuarios FREE acumulados, conversión 2% |

El MVE **no incluye** marketing pago agresivo ni sueldo del desarrollador; valida que el modelo Freemium puede sostener la nube antes de escalar comercialmente.

---

## 6. Escenarios

| Escenario | Usuarios FREE | Pro (conv.) | Ingreso/mes | Resultado vs CF $40k |
|-----------|---------------|-------------|-------------|----------------------|
| Pesimista | 200 | 2 (1%) | $9.000 | Déficit |
| Base | 500 | 10 (2%) | $45.000 | Equilibrio |
| Optimista | 1.000 | 40 (4%) | $180.000 | Superávit |

---

## 7. Conclusión de viabilidad

PreciosYa es **económicamente viable a escala reducida**: arquitectura serverless/PWA mantiene costos fijos bajos; el precio Pro ($4.500) está validado en campo (rango $3.000–$5.000) y representa &lt;0,5% del ingreso mensual típico de un kiosco. El riesgo principal no es el margen unitario sino la **adquisición y retención** frente al sustituto gratuito (papel/Excel). La barrera de salida aumenta con el historial de precios y el catálogo cargado — activo retenido en el modelo SaaS.
