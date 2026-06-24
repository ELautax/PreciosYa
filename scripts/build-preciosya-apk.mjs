#!/usr/bin/env node
/**
 * Genera preciosya.apk (TWA) vía PWABuilder Cloud y lo copia a apps/web/public/ + apps/landing/.
 * Uso: node scripts/build-preciosya-apk.mjs [APP_ORIGIN]
 *
 * Host por defecto: https://preciosya-app.vercel.app
 * (Google verifica assetlinks ahí; preciosya.vercel.app puede fallar verificación → barra Chrome.)
 *
 * Reutiliza android-signing/signing.keystore si existe (signingMode mine).
 * Contraseñas: env PRECICIOSYA_KEYSTORE_PASSWORD / PRECICIOSYA_KEY_PASSWORD o signing-key-info.txt local.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const keysDir = path.join(root, 'android-signing')

/** Un solo origen TWA — no usar additionalTrustedOrigins (falla si un dominio no verifica). */
const DEFAULT_TWA_HOST = 'https://preciosya-app.vercel.app'
const host = (process.argv[2] ?? DEFAULT_TWA_HOST).replace(/\/$/, '')

if (host.includes('preciosya.vercel.app') && !host.includes('preciosya-app')) {
  console.warn(
    '[apk] AVISO: preciosya.vercel.app puede fallar verificación Digital Asset Links.',
    'Recomendado: preciosya-app.vercel.app',
  )
}

function readSigningFromKeysDir() {
  const keystorePath = path.join(keysDir, 'signing.keystore')
  if (!fs.existsSync(keystorePath)) return null

  let storePassword = process.env.PRECICIOSYA_KEYSTORE_PASSWORD
  let keyPassword = process.env.PRECICIOSYA_KEY_PASSWORD
  let keyAlias = process.env.PRECICIOSYA_KEY_ALIAS ?? 'preciosya'

  const infoPath = path.join(keysDir, 'signing-key-info.txt')
  if (fs.existsSync(infoPath)) {
    const info = fs.readFileSync(infoPath, 'utf8')
    storePassword ??= info.match(/Key store password:\s*(.+)/)?.[1]?.trim()
    keyPassword ??= info.match(/Key password:\s*(.+)/)?.[1]?.trim()
    keyAlias = info.match(/Key alias:\s*(.+)/)?.[1]?.trim() ?? keyAlias
  }

  if (!storePassword || !keyPassword) {
    console.error(
      '[apk] Existe signing.keystore pero faltan contraseñas.',
      'Definí PRECICIOSYA_KEYSTORE_PASSWORD y PRECICIOSYA_KEY_PASSWORD.',
    )
    process.exit(1)
  }

  const file = `data:application/octet-stream;base64,${fs.readFileSync(keystorePath).toString('base64')}`
  return {
    signingMode: 'mine',
    signing: {
      file,
      alias: keyAlias,
      keyPassword,
      storePassword,
    },
  }
}

const existingSign = readSigningFromKeysDir()

const body = {
  additionalTrustedOrigins: [],
  appVersion: '1.0.0.2',
  appVersionCode: 3,
  backgroundColor: '#F5F5F4',
  display: 'standalone',
  enableNotifications: false,
  enableSiteSettingsShortcut: false,
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
  signing: existingSign?.signing ?? {
    alias: 'preciosya',
    countryCode: 'AR',
    fullName: 'PreciosYa',
    organization: 'PreciosYa',
    organizationalUnit: 'Mobile',
  },
  signingMode: existingSign?.signingMode ?? 'new',
  splashScreenFadeOutDuration: 300,
  startUrl: '/',
  themeColor: '#16A34A',
  themeColorDark: '#0A5425',
  webManifestUrl: `${host}/manifest.webmanifest`,
}

console.info(`[apk] Generando TWA para ${host} (signing: ${body.signingMode})…`)
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
const apkDestWeb = path.join(root, 'apps/web/public/preciosya.apk')
const apkDestLanding = path.join(root, 'apps/landing/preciosya.apk')
if (!fs.existsSync(apkSrc)) {
  console.error('[apk] No se encontró PreciosYa.apk firmado en el zip')
  process.exit(1)
}
fs.copyFileSync(apkSrc, apkDestWeb)
fs.copyFileSync(apkSrc, apkDestLanding)

const keyInfo = path.join(outDir, 'signing-key-info.txt')
if (fs.existsSync(keyInfo)) {
  fs.mkdirSync(keysDir, { recursive: true })
  for (const f of ['signing.keystore', 'signing-key-info.txt', 'assetlinks.json']) {
    const src = path.join(outDir, f)
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(keysDir, f))
  }
  const assetLinksDest = path.join(root, 'apps/web/public/.well-known/assetlinks.json')
  fs.mkdirSync(path.dirname(assetLinksDest), { recursive: true })
  fs.copyFileSync(path.join(outDir, 'assetlinks.json'), assetLinksDest)
  console.info(`[apk] Claves en ${keysDir}/ (no commitear)`)
}

console.info(`[apk] Listo → ${apkDestWeb} (${fs.statSync(apkDestWeb).size} bytes)`)
console.info(`[apk] Copia landing → ${apkDestLanding}`)
