# Imágenes del blog PreciosYa

Colocá tus archivos en estas carpetas. Si falta un archivo, el sitio usa gradiente de categoría o `assets/app.png` como respaldo.

## Estructura

```
apps/landing/assets/blog/
├── covers/          → miniatura en el índice del blog (cards)
├── heroes/          → imagen grande arriba de cada artículo
└── inline/          → (opcional) diagramas dentro del cuerpo del post
```

## Especificaciones

| Uso | Carpeta | Nombre de archivo | Tamaño recomendado | Formato | Contenido sugerido |
|-----|---------|-------------------|--------------------|---------|-------------------|
| Card índice | `covers/` | `{slug}-card.webp` o `.jpg` | **800 × 450 px** (16:9) | WebP o JPG | Una escena clara del tema: app, góndola, celular con WhatsApp, etc. |
| Hero artículo | `heroes/` | `{slug}-hero.webp` o `.jpg` | **1200 × 675 px** (16:9) | WebP o JPG | Misma idea pero más detalle; puede ser screenshot de la app con contexto. |
| Inline (opcional) | `inline/` | `{slug}-diagrama.webp` | **900 × 500 px** máx. | WebP o PNG | Fórmulas, flujos IPC, checklist visual. |

## Slugs actuales (nombres exactos)

| Artículo | `covers/` | `heroes/` | Tipo de imagen ideal |
|----------|-----------|-----------|----------------------|
| Calcular margen en kiosco | `margen-kiosco-card.jpg` | `margen-kiosco-hero.jpg` | **Screenshot** de PreciosYa: formulario producto con costo, margen % y precio calculado. Fondo: mostrador o góndola desenfocado. |
| Qué es el IPC INDEC | `ipc-indec-card.jpg` | `ipc-indec-hero.jpg` | **Infografía simple**: calendario mensual + referencia INDEC + flecha “costos ↑”. Colores verde/ámbar de la marca. |
| Lista precios WhatsApp | `lista-whatsapp-card.jpg` | `lista-whatsapp-hero.jpg` | **Mockup móvil**: chat de WhatsApp con imagen PNG de lista generada por PreciosYa. |
| Cinco errores de margen | `errores-margen-card.jpg` | `errores-margen-hero.jpg` | **Foto o ilustración** de libreta tachada vs pantalla con alerta de margen bajo en la app. |

> **Hoy:** hay imágenes reales en `covers/` y `heroes/`. Tres son PNG guardados como `.jpg` (funciona en navegadores); ideal exportar como WebP/JPG con **16:9** para cards y heroes. La infografía de margen es **vertical** — el CSS usa `blog-card-cover--portrait`; la comparativa de errores es **panorámica** — usa `blog-card-cover--wide`.

## Próximos posts (cuando publiques)

Usá el mismo patrón: `{slug}-card.webp` y `{slug}-hero.webp` donde `slug` = nombre del archivo `.html` sin extensión.

## Buenas prácticas

- Peso: **&lt; 150 KB** por card, **&lt; 250 KB** por hero (comprimí con [Squoosh](https://squoosh.app)).
- No uses stock genérico de “empresarios sonriendo”; mejor **tu app**, **tu rubro** (kiosco, almacén).
- Texto en imagen: mínimo y grande (se lee en celular).
- `alt` en HTML: ya está en cada artículo; actualizalo si cambiás la escena.

## Cómo reemplazar

1. Exportá la imagen con el nombre de la tabla.
2. Copiá a `covers/` o `heroes/`.
3. Redeploy landing (`cd apps/landing && npx vercel deploy --prod --yes`).

No hace falta tocar el HTML si respetás el nombre del archivo.
