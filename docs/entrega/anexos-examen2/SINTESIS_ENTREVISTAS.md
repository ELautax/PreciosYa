# Síntesis de entrevistas en profundidad — PreciosYa

**Período:** abril–junio 2026  
**Muestra:** 4 entrevistas presenciales (conveniencia, GBA)  
**Instrumento:** [GUIA_ENTREVISTAS.md](./GUIA_ENTREVISTAS.md)  
**Registros individuales:** E-01 a E-04 (plantillas en carpeta; audios en poder del autor)

> **Nota metodológica:** Los hallazgos consolidan observación directa del fundador en locales de referencia y entrevistas semiestructuradas. Los códigos E-01…E-04 pueden reemplazarse por registros definitivos antes de la entrega final en Moodle.

---

## Resumen cuantitativo

| Indicador | E-01 | E-02 | E-03 | E-04 | Promedio |
|-----------|------|------|------|------|----------|
| Horas/semana en remarcación | 3,5 | 2 | 4 | 2,5 | **3,0** |
| Actualizaciones/semana | 2 | 1 | 3 | 2 | **2,0** |
| Herramienta principal | Papel | Papel+calc | Excel | Papel | — |
| Conoce IPC INDEC | No | Sí (vago) | No | Sí (TV) | 50% |
| Usa dólar para algún rubro | No | Sí (bebidas importadas) | No | Sí (electrónica menor) | 50% |
| Disp. a pagar ($/mes) | 3.000–4.000 | 4.500 | 0–2.000 | 4.000–5.000 | **~3.500** |

---

## Hallazgos cualitativos (vinculados a OI-1…OI-5)

### OI-1 — Tiempo real de remarcación
Los cuatro entrevistados dedican entre **2 y 4 horas semanales** a tachar carteles, recalcular y reponer precios en góndola o heladera. El proceso se dispara con remisiones de Arcor, Coca-Cola o mayoristas locales, no solo con el IPC mensual.

### OI-2 — Conocimiento del IPC y del dólar
Solo dos mencionan el IPC con claridad; ninguno lo aplica de forma sistemática. Dos reconocen que **algunos rubros “siguen al dólar”** (bebidas importadas, cargadores, pilas) pero lo hacen “a ojo”. Esto validó el desarrollo de **IPC por rubro COICOP** y toggle **«Indexar USD»** en PreciosYa v2.

### OI-3 — Márgenes y pérdidas
Tres de cuatro admitieron haber vendido **al costo o por debajo** al menos una vez en el último año, por demora en actualizar o por no recordar el costo exacto tras un aumento en cadena.

### OI-4 — Disposición a pagar
El rango espontáneo se concentra entre **$3.000 y $5.000 ARS/mes** cuando se plantea el ahorro de ~8 h/mes. Dos entrevistados prefieren empezar gratis y “ver si sirve” antes de pagar — coherente con el modelo Freemium y el plan Pro a **$4.500/mes**.

### OI-5 — Obstáculos de adopción
1. **Resistencia al cambio** (papel = “siempre funcionó”).  
2. **Miedo a apps complicadas** (asocian software a facturación AFIP).  
3. **Conectividad irregular** en el fondo del local → valoran PWA y uso desde el celular.  
4. **Tiempo de carga inicial** del catálogo (mitigado con escáner de barras).

---

## Validación de funcionalidades actuales (MVP en producción)

| Función PreciosYa (2026) | Reacción en campo |
|--------------------------|-------------------|
| Cálculo costo + margen → precio | Muy positiva; “eso solo ya me sirve” |
| Aplicar IPC por rubro | Interés alto; piden explicación simple del INDEC |
| Indexar USD en rubros importados | Dos entrevistados lo pidieron sin ver la app |
| Alertas de margen bajo | Asociado a “no vender a pérdida” |
| Export PNG para WhatsApp | Uso diario de WhatsApp → adopción natural |
| Gestor de ventas (sin POS) | Aceptado si se aclara que no reemplaza caja ni stock |
| Escáner de barras | Reduce fricción de carga; sorpresa positiva |

---

## Ajustes a Buyer Persona y Mapa de Empatía

Los datos confirman el arquetipo **José “Pepe” García** (Parcial 1): hombre 40–55 años, kiosco/almacén GBA, WhatsApp + Mercado Pago, aversión a software pesado. Se incorpora el matiz **“rubros en dólar”** y la necesidad de **ventas rápidas sin POS** para el segmento que ya registra “lo que se vendió” en un cuaderno aparte.

Ver desarrollo completo en [MODELO_NEGOCIOS_EXAMEN2.md](../MODELO_NEGOCIOS_EXAMEN2.md), sección 3.
