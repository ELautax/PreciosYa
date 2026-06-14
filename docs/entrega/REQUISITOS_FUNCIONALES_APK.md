# Requisitos funcionales — APK (PreciosYa)

**Versión:** 1.0 · **Tipo:** Trusted Web Activity (TWA) — no app nativa  
**Build:** `scripts/build-preciosya-apk.mjs` → `apps/web/public/preciosya.apk`

## Contexto

La APK de PreciosYa **no es una aplicación nativa separada**. Es un contenedor Android (TWA) que abre la misma PWA desplegada en `https://preciosya.vercel.app`, con verificación Digital Asset Links.

**Paridad funcional:** todos los RF-W aplican salvo donde la plataforma imponga diferencias (instalación, permisos).

---

## Requisitos APK

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-A001 | Descarga APK desde landing `#descargar` | Must | Enlace a `/preciosya.apk`; headers `Content-Disposition: attachment` |
| RF-A002 | Instalación en Android 8+ | Must | Usuario puede instalar APK; icono en launcher |
| RF-A003 | Abrir app en URL de producción | Must | TWA carga `preciosya.vercel.app`; login Google funciona |
| RF-A004 | Paridad funcional con Web | Must | Mismas rutas, planes y API que navegador |
| RF-A005 | Permiso cámara para escáner | Must | Escáner productos y ventas solicita cámara; fallback manual |
| RF-A006 | Pantalla completa / sin barra URL | Must | Experiencia standalone como PWA |
| RF-A007 | Verificación assetlinks.json | Must | `.well-known/assetlinks.json` en dominio app |
| RF-A008 | Regeneración APK tras deploy | Should | Script con `APP_ORIGIN`; doc en DEPLOY_VERCEL |
| RF-A009 | Offline completo ventas | Won't v1 | Requiere outbox v2; PWA cache solo lectura |
| RF-A010 | Push notifications nativas | Won't v1 | Notificaciones vía web + Realtime |

## Diferencias APK vs navegador

| Aspecto | Web (Chrome/Safari) | APK TWA |
|---------|---------------------|---------|
| Instalación | PWA “Agregar a inicio” / Safari | APK sideload desde landing |
| iOS | PWA manual | No APK (solo web) |
| Actualizaciones | Automáticas al recargar SW | Misma; no store update |
| Cámara | Permiso navegador | Permiso Android + WebView |

## Casos de prueba asociados

Ver [CASOS_DE_PRUEBA.md](./CASOS_DE_PRUEBA.md): CP-A001 … CP-A005.
