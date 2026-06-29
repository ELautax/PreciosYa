# Documentación de entrega — PreciosYa (Tesis)

Material académico sección **2.1 Material documental entregado**.  
Fuente en Markdown; exportar a PDF/Word desde el editor o con Pandoc.

## Entrega principal (tesis)

| Documento | Archivo | Uso |
|-----------|---------|-----|
| **Carátula tesis** | [CARATULA_TESIS.md](./CARATULA_TESIS.md) | Primera página del PDF/Word |
| **Documento maestro** | [DOCUMENTO_ENTREGA_TESIS.md](./DOCUMENTO_ENTREGA_TESIS.md) | Lectura formal para el profesor (índice + resúmenes + modelo de negocios) |
| **Presentación HTML** | [presentacion-tesis.html](./presentacion-tesis.html) | 22 slides 1280×720 — exposición oral |
| Casos de prueba (formal) | [CASOS_DE_PRUEBA_FORMAL.md](./CASOS_DE_PRUEBA_FORMAL.md) | Formato bloque tipo Word (CP-01 a CP-27) |

### Exportar a Word/PDF

Desde la raíz del repo (requiere [Pandoc](https://pandoc.org/)):

```bash
cd docs/entrega
pandoc CARATULA_TESIS.md DOCUMENTO_ENTREGA_TESIS.md -o PreciosYa_Entrega_Tesis.docx
```

Para PDF: abrir el `.docx` en Word y exportar, o usar `pandoc ... -o PreciosYa_Entrega_Tesis.pdf`.

### Presentación HTML

1. Abrir `presentacion-tesis.html` en Chrome.
2. **Capturas:** DevTools → dimensiones 1280×720 por slide (scroll vertical).
3. **PDF:** Imprimir → Guardar como PDF (cada `.slide` es una página con `@media print`).

Diagramas complementarios: `porter-diagram-presentacion.html`, `foda-presentacion.html`, `canvas-presentacion.html`, `buyer-persona-presentacion.html`, `ecosistema-presentacion.html`.

### Cómo presentar al profesor (orden sugerido)

1. Entregar **documento Word/PDF** (`DOCUMENTO_ENTREGA_TESIS.md` exportado).
2. Exponer con **presentacion-tesis.html** + diagramas HTML individuales.
3. **Demo en vivo** siguiendo [CHECKLIST_DEMO.md](./CHECKLIST_DEMO.md) y suite CP en [CASOS_DE_PRUEBA.md](./CASOS_DE_PRUEBA.md).

---

## Checklist 2.1 — Documentos técnicos

| # | Documento | Archivo |
|---|-----------|---------|
| 1 | Manual de usuario | [MANUAL_USUARIO.md](./MANUAL_USUARIO.md) |
| 2 | Casos de uso | [CASOS_DE_USO.md](./CASOS_DE_USO.md) |
| 3 | Casos de prueba | [CASOS_DE_PRUEBA_FORMAL.md](./CASOS_DE_PRUEBA_FORMAL.md) · [tabla demo](./CASOS_DE_PRUEBA.md) |
| 4 | UML | [UML.md](./UML.md) |
| 5 | Requisitos funcionales Web | [REQUISITOS_FUNCIONALES_WEB.md](./REQUISITOS_FUNCIONALES_WEB.md) |
| 6 | Requisitos funcionales APK | [REQUISITOS_FUNCIONALES_APK.md](./REQUISITOS_FUNCIONALES_APK.md) |
| 7 | DER | [DER.md](./DER.md) |
| 8 | Diseño de arquitectura | [DISENO_ARQUITECTURA.md](./DISENO_ARQUITECTURA.md) |
| 9 | Diagrama de componentes | [DIAGRAMA_COMPONENTES.md](./DIAGRAMA_COMPONENTES.md) |
| 10 | Gantt | [GANTT.md](./GANTT.md) |
| 11 | **Modelo de negocios (2.º parcial)** | [MODELO_NEGOCIOS_EXAMEN2.md](./MODELO_NEGOCIOS_EXAMEN2.md) |
| 12 | Carátula examen 2 | [CARATULA_EXAMEN2.md](./CARATULA_EXAMEN2.md) |
| — | Parcial 1 actualizado (jun 2026) | [PARCIAL1_ACTUALIZADO.md](./PARCIAL1_ACTUALIZADO.md) |
| — | Presentación Gamma (examen 2) | [GAMMA_PRESENTACION_EXAMEN2.md](./GAMMA_PRESENTACION_EXAMEN2.md) |

## Anexos — Examen 2 (Modelos Estratégicos de Negocios)

Carpeta [anexos-examen2/](./anexos-examen2/):

| Anexo | Archivo |
|-------|---------|
| Guía de entrevistas | [GUIA_ENTREVISTAS.md](./anexos-examen2/GUIA_ENTREVISTAS.md) |
| Plantilla por entrevista | [PLANTILLA_ENTREVISTA.md](./anexos-examen2/PLANTILLA_ENTREVISTA.md) |
| Síntesis de campo | [SINTESIS_ENTREVISTAS.md](./anexos-examen2/SINTESIS_ENTREVISTAS.md) |
| Costos y viabilidad | [COSTOS_VIABILIDAD.md](./anexos-examen2/COSTOS_VIABILIDAD.md) |
| Piezas de contenido (2) | [PIEZAS_CONTENIDO.md](./anexos-examen2/PIEZAS_CONTENIDO.md) |
| Blog — 8 temas + nota 1 | [BLOG_PRIMERA_NOTA.md](./anexos-examen2/BLOG_PRIMERA_NOTA.md) |
| Bibliografía | [BIBLIOGRAFIA.md](./anexos-examen2/BIBLIOGRAFIA.md) |

**PDF único Moodle (examen 2):** carátula → desarrollo (`MODELO_NEGOCIOS_EXAMEN2.md`) → anexos en el orden de la tabla anterior.

```
RF-W / RF-A  →  Casos de uso (CU)  →  Casos de prueba (CP)  →  Tests / demo manual
```

## Referencias complementarias

- [PRECIOSYA.md](../PRECIOSYA.md) — visión de producto
- [ROADMAP_TESIS.md](../ROADMAP_TESIS.md) — guión defensa y v2
- [GUIA_USUARIO.md](../GUIA_USUARIO.md) — guía operativa resumida
- [CHECKLIST_DEMO.md](./CHECKLIST_DEMO.md) — pre-flight antes de presentar
