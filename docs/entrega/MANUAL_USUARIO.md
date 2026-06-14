# Manual de usuario — PreciosYa

**Versión:** 1.0 · **Plataforma:** Web PWA + APK Android (TWA)  
**URL producción:** https://preciosya.vercel.app  
**Landing:** https://preciosya-landing.vercel.app

---

## Índice

1. [Introducción](#1-introducción)
2. [Requisitos e instalación](#2-requisitos-e-instalación)
3. [Primeros pasos](#3-primeros-pasos)
4. [Navegación](#4-navegación)
5. [Módulos](#5-módulos)
6. [Matriz pantalla ↔ función](#6-matriz-pantalla--función)
7. [Planes y límites](#7-planes-y-límites)
8. [Solución de problemas](#8-solución-de-problemas)
9. [Glosario](#9-glosario)

---

## 1. Introducción

PreciosYa ayuda a comercios minoristas argentinos a:

- Calcular precios de venta desde costo y margen.
- Actualizar masivamente con **IPC INDEC** por rubro o **dólar BCRA** en rubros importados.
- Exportar listas PNG para WhatsApp.
- Registrar ventas y ver rentabilidad estimada (**no es caja registradora**).

---

## 2. Requisitos e instalación

### Web (cualquier dispositivo)

- Navegador moderno (Chrome, Safari, Edge).
- Conexión a internet (ventas v1 requieren online).

### Android — APK

1. Abrí https://preciosya-landing.vercel.app/#descargar
2. Descargá **PreciosYa.apk** e instalá (permitir orígenes desconocidos si el sistema lo pide).
3. Abrí la app → mismo login Google que la web.

> La APK es un acceso directo a la web optimizada (TWA), no una app nativa distinta.

### iPhone

Safari → compartir → **Agregar a pantalla de inicio**.

---

## 3. Primeros pasos

1. **Iniciar sesión** con Google.
2. **Crear local** (nombre del negocio) en Locales o al onboarding.
3. **Activar rubros** en Categorías (solo los que vendés).
4. En rubros importados: activar **Indexar USD**.
5. **Cargar productos** (manual o escáner).
6. Opcional: **Registrar venta** desde Panel o menú Ventas.

---

## 4. Navegación

### Móvil (barra inferior)

| Ícono | Destino |
|-------|---------|
| Panel | Dashboard resumen |
| Productos | Catálogo |
| Ventas | Gestor de ventas |
| Historial | IPC + precios producto |
| Más | Categorías, Locales, Ajustes, Admin, Cerrar sesión |

### Escritorio (sidebar)

Mismas secciones en menú lateral colapsable. Badge de plan (Free/Pro/Agency/Admin) arriba a la derecha.

---

## 5. Módulos

### 5.1 Productos

- **Nuevo:** rubro, nombre, costo, margen %, barcode opcional.
- **Escáner:** botón cámara en formulario.
- **Actualizar:** pestañas Porcentaje e IPC/USD.
- **Exportar:** genera PNG de lista de precios.

### 5.2 Rubros (Categorías)

- Activar/desactivar rubros COICOP.
- **Indexar USD:** ese rubro sigue dólar BCRA, no IPC mensual.

### 5.3 IPC y USD

- **IPC pendiente:** banner amarillo → Aplicar → confirmar desglose.
- **USD:** cotización del día; aplicar solo rubros USD.
- Tras aplicar: banner verde hasta nuevo período.

### 5.4 Historial

- Gráfico IPC 12 meses.
- Por producto: evolución costo/precio con motivo (manual, IPC, USD…).

### 5.5 Ventas

| Tab | Función |
|-----|---------|
| Resumen | KPIs, gráficos (Pro: ganancia, análisis extendido) |
| Registrar | Draft + escáner + fecha/hora + confirmar |
| Historial | Lista ventas (Free: 7 días) |
| Análisis | Rankings Pro; Free ve CTA upgrade |

### 5.6 Ajustes

- **Negocio:** resumen local (editar en Locales).
- **Cuenta:** email, plan, vencimiento.
- **Plan:** modal comparativa; contacto Pro/Agency por email.

### 5.7 Admin (solo administradores)

- Sync IPC Alphacast.
- Carga manual IPC.
- Gestión usuarios y planes.

---

## 6. Matriz pantalla ↔ función

| Pantalla | RF principal | Acciones clave |
|----------|--------------|----------------|
| `/login` | RF-W001 | OAuth Google |
| `/dashboard` | — | KPIs, acciones rápidas |
| `/products` | RF-W020–033 | CRUD, bulk, export |
| `/categories` | RF-W012–013 | Rubros, USD toggle |
| `/history` | RF-W034 | Gráficos IPC/producto |
| `/sales` | RF-W050–053 | Ventas |
| `/locals` | RF-W010 | CRUD locales |
| `/settings` | RF-W061 | Plan, cuenta |
| `/admin` | RF-W062 | IPC, usuarios |

---

## 7. Planes y límites

| Plan | Productos | Locales | Ventas |
|------|-----------|---------|--------|
| Free | 30 | 1 | Registro + resumen/historial **7 días** |
| Pro | Ilimitado | 3 | Analytics completo |
| Agency | Ilimitado | Ilimitado | + multi-cliente |

Contacto upgrade: hola@preciosya.app (desde modal Plan).

---

## 8. Solución de problemas

| Problema | Qué hacer |
|----------|-----------|
| No carga tras login | Verificar conexión; probar incógnito; CORS: usar preciosya.vercel.app |
| "Creá un local" con local existente | Migraciones DB pendientes — contactar admin o ver FIX_MIGRACIONES |
| USD "Sin datos" | Esperar sincronización diaria; verificar API en producción |
| IPC igual en todos los rubros | Alphacast no disponible; admin puede cargar IPC manual |
| Análisis ventas bloqueado | Plan Free — upgrade Pro para períodos largos |
| Escáner no abre | Permitir cámara en navegador/Android |
| APK no instala | Habilitar instalación desde fuentes desconocidas |

---

## 9. Glosario

| Término | Significado |
|---------|-------------|
| **IPC** | Índice de Precios al Consumidor (INDEC) |
| **COICOP** | Clasificación de rubros de consumo |
| **Margen** | `(precio - costo) / costo × 100` |
| **Snapshot venta** | Costo/precio guardados al registrar venta |
| **TWA** | Trusted Web Activity — APK que abre la PWA |
| **PWA** | Progressive Web App — instalable desde navegador |

---

*Basado en [GUIA_USUARIO.md](../GUIA_USUARIO.md). Para requisitos formales ver [REQUISITOS_FUNCIONALES_WEB.md](./REQUISITOS_FUNCIONALES_WEB.md).*
