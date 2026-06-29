# Casos de prueba — PreciosYa (formato formal)

**Versión:** 1.0 · **Autor:** Lautaro Nahuel Villanueva  
**Convención:** CP-XX trazado a CU-XXX y RF-W/RF-A.  
**Referencia rápida demo:** [CASOS_DE_PRUEBA.md](./CASOS_DE_PRUEBA.md)

---

## CP-01

**ID de caso de prueba:** CP-01

**Descripción/resumen:** Validar login exitoso con Google/Supabase.

**Pasos de prueba:**
1. Obtener accessToken válido de Supabase.
2. Ejecutar POST /api/auth/google con Bearer token.
3. Verificar respuesta del endpoint.

**Resultado esperado:** HTTP 200, retorna usuario serializado y sesión utilizable.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Supabase configurado; usuario existente.

**Categoría de prueba:** Funcional / API / Autenticación.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, parcialmente automatizable con test de integración HTTP.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Ninguna.

**Trazabilidad:** CU-01 · RF-W001

---

## CP-02

**ID de caso de prueba:** CP-02

**Descripción/resumen:** Validar rechazo de login sin token.

**Pasos de prueba:**
1. Ejecutar POST /api/auth/google sin body y sin header Authorization.
2. Revisar código y payload de error.

**Resultado esperado:** HTTP 400, código AUTH_BODY_INVALID.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** API levantada.

**Categoría de prueba:** Negativa / API / Validación.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, con test automatizado de endpoint.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Verificar mensaje de error para UX.

**Trazabilidad:** CU-01 · RF-W001

---

## CP-03

**ID de caso de prueba:** CP-03

**Descripción/resumen:** Validar seguridad en endpoint protegido sin autenticación.

**Pasos de prueba:**
1. Ejecutar GET /api/products sin header Authorization.
2. Revisar código de respuesta.

**Resultado esperado:** HTTP 401, código UNAUTHORIZED.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** API levantada.

**Categoría de prueba:** Seguridad / API.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, con pruebas de integración.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Caso clave de control de acceso.

**Trazabilidad:** CU-01 · RF-W002

---

## CP-04

**ID de caso de prueba:** CP-04

**Descripción/resumen:** Validar alta de producto con reglas de precio.

**Pasos de prueba:**
1. Autenticar usuario con local propio.
2. Ejecutar POST /api/products con cost > 0 y marginPct >= 0.
3. Consultar producto creado.

**Resultado esperado:** Producto persistido con salePrice calculado.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Usuario autenticado; local activo del usuario.

**Categoría de prueba:** Funcional / Negocio / API.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, recomendable en test de servicio + API.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Verificar redondeo de precio a decenas.

**Trazabilidad:** CU-04 · RF-W020

---

## CP-05

**ID de caso de prueba:** CP-05

**Descripción/resumen:** Validar límite de productos para plan FREE.

**Pasos de prueba:**
1. Preparar usuario FREE con cupo máximo alcanzado (30 productos).
2. Ejecutar POST /api/products con un producto adicional.
3. Revisar respuesta.

**Resultado esperado:** HTTP 403, código PRODUCT_LIMIT_REACHED.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Usuario FREE con límite alcanzado.

**Categoría de prueba:** Regla de negocio / Negativa.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, con fixtures de datos.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Caso importante para la monetización.

**Trazabilidad:** CU-04 · RF-W060

---

## CP-06

**ID de caso de prueba:** CP-06

**Descripción/resumen:** Validar ownership de recursos.

**Pasos de prueba:**
1. Autenticar usuario A.
2. Intentar operar sobre recurso de usuario B.
3. Validar respuesta.

**Resultado esperado:** HTTP 403, código FORBIDDEN.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Dos usuarios con recursos separados.

**Categoría de prueba:** Seguridad / Autorización.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, con pruebas de integración.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Puede validarse en products, locals y categories.

**Trazabilidad:** CU-02 · RF-W010

---

## CP-07

**ID de caso de prueba:** CP-07

**Descripción/resumen:** Validar sincronización realtime de notificaciones.

**Pasos de prueba:**
1. Abrir frontend con usuario autenticado y suscripción activa.
2. Crear notificación para ese usuario desde API/DB.
3. Verificar actualización de listado y contador.

**Resultado esperado:** UI se actualiza sin recarga manual.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Realtime de Supabase activo; sesión válida.

**Categoría de prueba:** Integración / Realtime / UX.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Parcial; se puede automatizar backend, UI idealmente E2E.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Revisar latencia de propagación.

**Trazabilidad:** CU-10 · RF-W042

---

## CP-08

**ID de caso de prueba:** CP-08

**Descripción/resumen:** Validar ejecución del job IPC con proveedor disponible.

**Pasos de prueba:**
1. Ejecutar scheduler en ventana válida o forzar fetch admin.
2. Verificar persistencia en economic_indices.
3. Verificar creación de notificaciones NEW_IPC.

**Resultado esperado:** Índice guardado, notificaciones creadas y log de éxito.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** API IPC disponible; scheduler activo.

**Categoría de prueba:** Integración / Scheduler.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Parcial; componente externo puede mockearse.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Registrar timestamp de ejecución.

**Trazabilidad:** CU-17 · RF-W030

---

## CP-09

**ID de caso de prueba:** CP-09

**Descripción/resumen:** Validar comportamiento del job IPC ante caída de INDEC con caché.

**Pasos de prueba:**
1. Simular INDEC no disponible.
2. Asegurar existencia de IPC cacheado.
3. Ejecutar job IPC.

**Resultado esperado:** Sistema no cae; mantiene caché y genera warning.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Caché previo de IPC en DB.

**Categoría de prueba:** Resiliencia / Integración.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, con mocks de proveedor externo.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Confirmar que no rompe flujo general.

**Trazabilidad:** CU-17 · RF-W030

---

## CP-10

**ID de caso de prueba:** CP-10

**Descripción/resumen:** Validar exportación PNG correcta.

**Pasos de prueba:**
1. Autenticar usuario con local propio.
2. Subir archivo image/png al endpoint de exportación.
3. Verificar URL y registro en price_lists.

**Resultado esperado:** HTTP 200, URL de archivo y registro persistido.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Supabase Storage operativo; local válido.

**Categoría de prueba:** Integración / API / Archivos.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, integración backend con storage de prueba.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Revisar expiración de URL firmada.

**Trazabilidad:** CU-14 · RF-W040

---

## CP-11

**ID de caso de prueba:** CP-11

**Descripción/resumen:** Validar rechazo de exportación con MIME inválido.

**Pasos de prueba:**
1. Autenticar usuario.
2. Subir archivo con MIME no permitido (ej. application/pdf).
3. Revisar respuesta.

**Resultado esperado:** HTTP 400, código INVALID_FILE_TYPE.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Endpoint de exportación disponible.

**Categoría de prueba:** Negativa / Validación / Archivos.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, con test automatizado de API.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Verificar mensaje de error amigable.

**Trazabilidad:** CU-14 · RF-W040

---

## CP-12

**ID de caso de prueba:** CP-12

**Descripción/resumen:** Validar cambio de plan por administrador.

**Pasos de prueba:**
1. Autenticar usuario admin.
2. Ejecutar PUT /api/admin/users/:id/plan con plan válido.
3. Validar cambios consultando datos de usuario.

**Resultado esperado:** HTTP 200, plan actualizado y consistente.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Usuario admin configurado; usuario objetivo existente.

**Categoría de prueba:** Funcional / Admin / Autorización.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí, en suite de integración admin.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Confirmar impacto en límites de plan.

**Trazabilidad:** CU-16 · RF-W070

---

## CP-13

**ID de caso de prueba:** CP-13

**Descripción/resumen:** Validar login exitoso desde la interfaz web (Google OAuth).

**Pasos de prueba:**
1. Abrir https://preciosya.vercel.app sin sesión.
2. Pulsar «Continuar con Google» y completar OAuth.
3. Verificar redirección al dashboard con nombre de usuario visible.

**Resultado esperado:** Dashboard carga; sesión activa; menú lateral visible.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Cuenta Google de prueba; CORS y env de producción configurados.

**Categoría de prueba:** Funcional / UI / Autenticación.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** No (OAuth interactivo).

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Caso incluido en suite demo tesis (5–7 min).

**Trazabilidad:** CU-01 · RF-W001

---

## CP-14

**ID de caso de prueba:** CP-14

**Descripción/resumen:** Validar cierre de sesión desde la app.

**Pasos de prueba:**
1. Iniciar sesión en la app.
2. Ir a Configuración → Cerrar sesión.
3. Intentar acceder a /dashboard.

**Resultado esperado:** Redirige a /login; llamadas API retornan 401.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Sesión activa.

**Categoría de prueba:** Funcional / UI / Autenticación.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Parcial.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Ninguna.

**Trazabilidad:** CU-01 · RF-W003

---

## CP-15

**ID de caso de prueba:** CP-15

**Descripción/resumen:** Validar creación de producto desde UI con cálculo de precio.

**Pasos de prueba:**
1. Autenticar usuario con local activo.
2. Ir a Productos → Nuevo producto.
3. Ingresar costo 100 y margen 30%; guardar.

**Resultado esperado:** Precio de venta calculado y redondeado a decenas; producto visible en lista.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Local activo; cupo Free disponible.

**Categoría de prueba:** Funcional / UI / Negocio.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** No (demo manual).

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Suite demo tesis paso 2.

**Trazabilidad:** CU-04 · RF-W020

---

## CP-16

**ID de caso de prueba:** CP-16

**Descripción/resumen:** Validar escáner de código de barras en formulario de producto.

**Pasos de prueba:**
1. Abrir formulario de producto en dispositivo con cámara.
2. Activar escáner y apuntar a código conocido.
3. Verificar autocompletado de nombre.

**Resultado esperado:** Campo nombre/barcode completado; usuario puede confirmar y guardar.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Permiso de cámara; HTTPS o localhost.

**Categoría de prueba:** Funcional / UI / Móvil.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** No.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Probar también en APK TWA (CP-27).

**Trazabilidad:** CU-04 · RF-W021

---

## CP-17

**ID de caso de prueba:** CP-17

**Descripción/resumen:** Validar alerta visual de margen bajo el mínimo del local.

**Pasos de prueba:**
1. Configurar min_margin_pct = 20% en el local.
2. Crear o editar producto con margen 15%.
3. Observar badge en listado de productos.

**Resultado esperado:** Badge de alerta rojo/naranja; is_margin_alert = true en API.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Local con margen mínimo configurado.

**Categoría de prueba:** Funcional / UI / Regla de negocio.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Parcial (servicio product).

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Ninguna.

**Trazabilidad:** CU-06 · RF-W022

---

## CP-18

**ID de caso de prueba:** CP-18

**Descripción/resumen:** Validar aplicación de IPC por rubro desde la UI.

**Pasos de prueba:**
1. Tener IPC del mes disponible en economic_indices.
2. Ir a Dashboard o modal de actualización → Aplicar IPC.
3. Confirmar y revisar productos afectados.

**Resultado esperado:** Costos actualizados; banner verde «ya aplicado»; historial IPC_INDEC.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Productos en rubros IPC (no USD); índice del mes cargado.

**Categoría de prueba:** Funcional / UI / Integración.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Parcial (CP-08 backend).

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Suite demo tesis paso 3.

**Trazabilidad:** CU-08 · RF-W031

---

## CP-19

**ID de caso de prueba:** CP-19

**Descripción/resumen:** Validar aplicación de variación USD solo en rubros indexados.

**Pasos de prueba:**
1. Activar «Indexar USD» en al menos un rubro.
2. Ejecutar Aplicar USD desde la app.
3. Verificar que solo productos de ese rubro cambian.

**Resultado esperado:** Rubros IPC sin cambio; rubros USD actualizados; historial BCRA_RATE.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Cotización BCRA del día en DB.

**Categoría de prueba:** Funcional / UI / Integración.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Parcial.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Ninguna.

**Trazabilidad:** CU-09 · RF-W032

---

## CP-20

**ID de caso de prueba:** CP-20

**Descripción/resumen:** Validar actualización masiva por porcentaje.

**Pasos de prueba:**
1. Tener al menos 3 productos activos.
2. Abrir modal Actualización masiva → pestaña Porcentaje.
3. Aplicar +10% a todo el local.

**Resultado esperado:** Costos incrementados; entradas en price_history con change_reason BULK_PCT.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Productos cargados.

**Categoría de prueba:** Funcional / UI / Negocio.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí (integration bulk-update).

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Ninguna.

**Trazabilidad:** CU-07 · RF-W033

---

## CP-21

**ID de caso de prueba:** CP-21

**Descripción/resumen:** Validar registro de venta con múltiples líneas.

**Pasos de prueba:**
1. Tener al menos 2 productos con precio de venta.
2. Ir a Ventas → Nueva venta.
3. Agregar 2 líneas y confirmar.

**Resultado esperado:** Toast de éxito; venta en historial; snapshots de costo/precio en sale_lines.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Productos activos; conexión online.

**Categoría de prueba:** Funcional / UI / Ventas.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** Sí (POST /api/sales).

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Suite demo tesis paso 4.

**Trazabilidad:** CU-12 · RF-W050

---

## CP-22

**ID de caso de prueba:** CP-22

**Descripción/resumen:** Validar resumen de ventas del día en dashboard de ventas.

**Pasos de prueba:**
1. Registrar al menos una venta en el día actual.
2. Ir a Ventas → pestaña Resumen → período Hoy.
3. Revisar KPIs de cantidad e ingreso.

**Resultado esperado:** KPI > 0; datos coherentes con ventas registradas.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Ventas del día cargadas.

**Categoría de prueba:** Funcional / UI / Ventas.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** No.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Suite demo tesis paso 5.

**Trazabilidad:** CU-11 · RF-W051

---

## CP-23

**ID de caso de prueba:** CP-23

**Descripción/resumen:** Validar exportación y compartición de lista PNG desde la UI.

**Pasos de prueba:**
1. Tener productos activos en el local.
2. Ir a Lista de precios → Generar PNG.
3. Descargar o compartir vía Web Share API.

**Resultado esperado:** Imagen PNG legible con precios; opción compartir en móvil.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Productos activos; navegador compatible.

**Categoría de prueba:** Funcional / UI / Export.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** No (html2canvas en cliente).

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Suite demo tesis paso 6. Complementa CP-10 (API upload).

**Trazabilidad:** CU-14 · RF-W040

---

## CP-24

**ID de caso de prueba:** CP-24

**Descripción/resumen:** Validar modal de planes y CTA de upgrade.

**Pasos de prueba:**
1. Iniciar sesión con plan Free.
2. Ir a Configuración → Mi plan → Mejorar plan.
3. Revisar comparativa Free / Pro / Agency.

**Resultado esperado:** Modal con 3 planes; precio Pro $4.500 visible; enlace a Mercado Pago o mensaje sandbox.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Usuario plan Free.

**Categoría de prueba:** Funcional / UI / Monetización.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** No.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** MP en sandbox en etapa tesis.

**Trazabilidad:** CU-15 · RF-W061

---

## CP-25

**ID de caso de prueba:** CP-25

**Descripción/resumen:** Validar descarga e instalación de APK desde landing.

**Pasos de prueba:**
1. Abrir landing en Android → sección Descargar.
2. Descargar preciosya.apk.
3. Instalar con permiso de fuentes desconocidas.

**Resultado esperado:** APK instala; icono en launcher.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** Dispositivo Android 8+.

**Categoría de prueba:** Funcional / APK / Distribución.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** No.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** TWA, no app nativa.

**Trazabilidad:** CU-18 · RF-A001

---

## CP-26

**ID de caso de prueba:** CP-26

**Descripción/resumen:** Validar apertura de app en APK con paridad funcional web.

**Pasos de prueba:**
1. Abrir PreciosYa desde icono instalado.
2. Completar login Google.
3. Navegar a Dashboard y Productos.

**Resultado esperado:** Misma experiencia que PWA; sin barra de URL.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** APK instalada (CP-25).

**Categoría de prueba:** Funcional / APK.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** No.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Ninguna.

**Trazabilidad:** CU-18 · RF-A003

---

## CP-27

**ID de caso de prueba:** CP-27

**Descripción/resumen:** Validar escáner de barras en APK Android.

**Pasos de prueba:**
1. Abrir formulario de producto en APK.
2. Conceder permiso de cámara.
3. Escanear código de barras de producto de prueba.

**Resultado esperado:** Código detectado; autocompletado de datos.

**Resultado real:** Pendiente de ejecución.

**Prerrequisitos:** APK instalada; permiso cámara.

**Categoría de prueba:** Funcional / APK / Móvil.

**Autor:** Lautaro Nahuel Villanueva.

**Automatización:** No.

**Aprobado/reprobado:** Pendiente.

**Observaciones:** Complementa CP-16 en web.

**Trazabilidad:** CU-04 · RF-A005

---

*Fin del documento formal. Total: 27 casos (CP-01 a CP-27).*
