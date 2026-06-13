# Guía de usuario — PreciosYa

## Instalar la app en el celular

- **Android:** descargá el APK desde la **landing** (https://preciosya-landing.vercel.app/#descargar). El login de la app ya no muestra el bloque de descarga, solo un link de texto a la landing.
- **iPhone:** abrí la app web en Safari y usá «Agregar a pantalla de inicio».

## Primeros pasos

1. Iniciá sesión con Google.
2. Creá tu **primer local** (nombre del negocio).
3. Entrá a **Rubros** y activá los que vendés (Lácteos, Bebidas, etc.).
4. En rubros importados o dolarizados, activá **Indexar USD**.
5. Cargá productos en **Catálogo** (manual o escáner de código de barras).

---

## Cargar un producto

1. **Nuevo producto**.
2. Elegí **rubro** (recomendado): define si el producto sigue **IPC** o **USD** en actualizaciones masivas.
3. Ingresá **costo** y **margen %**; el precio de venta se calcula solo.
4. Opcional: código de barras (escáner o teclado).

> No hace falta elegir IPC o USD en cada producto: eso se configura una vez por rubro en **Categorías**.

---

## Cuando sale un nuevo IPC

1. En **Productos** verás un aviso **IPC pendiente** (o un mensaje verde si ya lo aplicaste este mes).
2. Tocá **Aplicar IPC** → revisá el desglose por rubro → confirmá.
3. Solo se actualizan productos en rubros **IPC** (no los marcados como USD).
4. El aviso desaparece hasta el próximo mes.

---

## Cuando sube el dólar (BCRA)

1. El panel muestra **cotización oficial** y variación del día.
2. Si el salto es fuerte, podés recibir una **notificación**.
3. **Aplicar USD** actualiza solo productos en rubros con **Indexar USD**.
4. Tras aplicar, el banner pasa a **ya aplicado** para ese día.

---

## Rubros: IPC vs USD

| Configuración | Qué significa | Ejemplo de productos |
|---------------|---------------|----------------------|
| Rubro activo, sin USD | Ajuste por IPC de esa división INDEC | Pan, limpieza local |
| Rubro activo + Indexar USD | Ajuste por variación diaria USD BCRA | Celulares, insumos importados |

Para volver a IPC: desactivá **Indexar USD** en el rubro.

---

## Actualización por porcentaje

Si tenés un aumento puntual (proveedor, promoción):

1. **Actualizar** → pestaña **Porcentaje**.
2. Ingresá % y opcionalmente filtrá por rubro.

---

## Historial

**Historial** muestra cada cambio de costo/precio con fecha y motivo (manual, IPC, USD, importación, masivo).

---

## Exportar lista

**Exportar** genera un PNG con tus productos y precios de venta para clientes.

---

## Gestor de ventas

Menú **Ventas** → pestañas:

1. **Resumen** — KPIs (hoy, período, ticket promedio). En Pro: ganancia estimada y gráficos.
2. **Registrar** — escaneá o buscá productos, armá una lista (carga rápida del día) y confirmá. Podés elegir **fecha y hora** de la venta.
3. **Historial** — ventas registradas con detalle de ítems.
4. **Análisis** (Pro) — más vendidos, más rentables, estancados, para promocionar, estrellas y por rubro.

No hay cobro ni ticket: solo registrás qué vendiste para estadísticas y márgenes.

---

## Plan y suscripción

En **Configuración → Plan** ves tu uso (productos y locales) y vencimiento. Tocá **Mejorar plan** (Free) o **Gestionar plan** (Pro/Agency) para abrir el modal con la comparativa de planes.

| Plan | Para quién | Lo principal |
|------|------------|--------------|
| **Free** | Probar sin tarjeta | Hasta 30 productos, 1 local, rubros, escáner, export PNG, **ventas 7 días** |
| **Pro** | Comercio activo | Productos ilimitados, 3 locales, **IPC**, **USD BCRA**, alertas, historial, **gestor de ventas completo** |
| **Agency** | Estudios, contadores, cadenas | Locales ilimitados, multi-cliente; **precio a medida** — botón «Contactar ventas» abre un mail a hola@preciosya.app |

Para pasar a Pro o Agency usá los botones de la misma pantalla o escribinos por mail. La landing tiene la misma información en [preciosya-landing.vercel.app/#precios](https://preciosya-landing.vercel.app/#precios).

---

## Preguntas frecuentes

**¿Por qué el USD muestra “Sin datos”?**  
La API debe estar actualizada y con acceso al BCRA. Al abrir la app se intenta sincronizar; si persiste, contactá soporte o administrador.

**¿Puedo aplicar IPC dos veces el mismo mes?**  
Sí, pero el sistema ya marca el mes como aplicado para no confundirte; solo repetí si hubo un error y querés recalcular.

**¿Productos sin rubro?**  
Entran solo en **IPC general** al aplicar IPC; no en ajuste USD.
