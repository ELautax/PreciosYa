#!/usr/bin/env node
/**
 * Genera preciosya.apk (TWA) vía PWABuilder Cloud y lo copia a apps/web/public/.
 * Uso: node scripts/build-preciosya-apk.mjs [APP_ORIGIN]
 * Default: https://preciosya-app.vercel.app
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const host = (process.argv[2] ?? 'https://preciosya-app.vercel.app').replace(/\/$/, '')

const body = {
  additionalTrustedOrigins: [],
  appVersion: '1.0.0.0',
  appVersionCode: 1,
  backgroundColor: '#F5F5F4',
  display: 'standalone',
  enableNotifications: false,
  enableSiteSettingsShortcut: true,
  fallbackType: 'customtabs',
  features: { locationDelegation: { enabled: true }, playBilling: { enabled: false } },
  host,
  iconUrl: `${host}/pwa-512x512.png`,
  includeSourceCode: false,
  isChromeOSOnly: false,
  launcherName: 'PreciosYa',
  maskableIconUrl: `${host}/pwa-512x512.png`,
  monochromeIconUrl: null,
  name: 'PreciosYa',
  navigationColor: '#16A34A',
  navigationColorDark: '#16A34A',
  navigationDividerColor: '#16A34A',
  navigationDividerColorDark: '#16A34A',
  orientation: 'portrait',
  packageId: 'app.preciosya.twa',
  serviceAccountJsonFile: null,
  shortcuts: [],
  signing: {
    alias: 'preciosya',
    countryCode: 'AR',
    fullName: 'PreciosYa',
    organization: 'PreciosYa',
    organizationalUnit: 'Mobile',
  },
  signingMode: 'new',
  splashScreenFadeOutDuration: 300,
  startUrl: '/',
  themeColor: '#16A34A',
  themeColorDark: '#0A5425',
  webManifestUrl: `${host}/manifest.webmanifest`,
}

console.info(`[apk] Generando TWA para ${host}…`)
const res = await fetch('https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

const buf = Buffer.from(await res.arrayBuffer())
if (!res.ok) {
  console.error(buf.toString('utf8'))
  process.exit(1)
}

const zipPath = path.join(root, 'preciosya-apk.zip')
const outDir = path.join(root, 'preciosya-apk-out')
fs.writeFileSync(zipPath, buf)
execSync(
  `powershell -Command "Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${outDir.replace(/'/g, "''")}' -Force"`,
  { stdio: 'inherit' },
)

const apkSrc = path.join(outDir, 'PreciosYa.apk')
const apkDest = path.join(root, 'apps/web/public/preciosya.apk')
if (!fs.existsSync(apkSrc)) {
  console.error('[apk] No se encontró PreciosYa.apk firmado en el zip')
  process.exit(1)
}
fs.copyFileSync(apkSrc, apkDest)

const keyInfo = path.join(outDir, 'signing-key-info.txt')
if (fs.existsSync(keyInfo)) {
  const keysDir = path.join(root, 'android-signing')
  fs.mkdirSync(keysDir, { recursive: true })
  for (const f of ['signing.keystore', 'signing-key-info.txt', 'assetlinks.json']) {
    const src = path.join(outDir, f)
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(keysDir, f))
  }
  const assetLinksDest = path.join(root, 'apps/web/public/.well-known/assetlinks.json')
  fs.mkdirSync(path.dirname(assetLinksDest), { recursive: true })
  fs.copyFileSync(path.join(outDir, 'assetlinks.json'), assetLinksDest)
  console.info(`[apk] Claves de firma guardadas en ${keysDir}/ (no commitear)`)
}

console.info(`[apk] Listo → ${apkDest} (${fs.statSync(apkDest).size} bytes)`)
