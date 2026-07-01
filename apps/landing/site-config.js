/** URL pública de la app (Vercel). Actualizar si cambia el alias de producción. */
window.PRECIOSYA_APP_ORIGIN = 'https://preciosya.vercel.app'
/** Landing estática: el APK se sirve acá (evita el rewrite SPA de la app). */
window.PRECIOSYA_LANDING_ORIGIN = 'https://preciosya-landing.vercel.app'
window.PRECIOSYA_PRO_CHECKOUT =
  window.PRECIOSYA_APP_ORIGIN + '/login?upgrade=pro'
window.PRECIOSYA_PRO_MAIL =
  'mailto:hola@preciosya.app?subject=Consulta%20plan%20Pro%20%E2%80%94%20PreciosYa&body=Hola%2C%20quiero%20pasar%20al%20plan%20Pro.%0A%0ALocal%20%2F%20negocio%3A%20%0A%0A'
window.PRECIOSYA_APP_LOGIN = window.PRECIOSYA_APP_ORIGIN + '/login?from=landing'
window.PRECIOSYA_APP_APK = window.PRECIOSYA_LANDING_ORIGIN + '/preciosya.apk'

/**
 * Navegación principal — única fuente de verdad (landing + blog).
 * site.js la inyecta en .nav-desktop y #mobileMenu.
 */
window.PRECIOSYA_NAV = [
  { id: 'funcionalidades', label: 'Funcionalidades', hash: '#funcionalidades' },
  { id: 'como-funciona', label: 'Cómo funciona', hash: '#como-funciona' },
  { id: 'precios', label: 'Precios', hash: '#precios' },
  { id: 'blog', label: 'Blog', hash: null, blogPath: './' },
  { id: 'descargar', label: 'Descargar app', hash: '#descargar' },
  { id: 'faq', label: 'FAQ', hash: '#faq' },
]
