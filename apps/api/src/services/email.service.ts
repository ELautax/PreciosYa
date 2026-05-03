import { env } from '../config/env.js'

function logDevEmail(kind: string, payload: Record<string, string>): void {
  if (env.NODE_ENV !== 'production') {
    console.info(`[email] ${kind} (sin RESEND_API_KEY): ${JSON.stringify(payload)}`)
  }
}

export async function sendWelcomeEmail(toEmail: string, displayName: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logDevEmail('welcome', { toEmail, displayName })
    return
  }

  // TODO: Integrar proveedor real (Resend) en producción.
}

export async function sendNewIPCEmail(input: {
  toEmail: string
  displayName: string
  ipcPct: number
  period: Date
}): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logDevEmail('new-ipc', {
      toEmail: input.toEmail,
      displayName: input.displayName,
      ipcPct: input.ipcPct.toFixed(2),
      period: input.period.toISOString().slice(0, 7),
    })
    return
  }

  // TODO: Integrar proveedor real (Resend) en producción.
}

export async function sendMarginAlertEmail(input: {
  toEmail: string
  displayName: string
  localName: string
  productName: string
  marginPct: number
  minMarginPct: number
}): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logDevEmail('margin-alert', {
      toEmail: input.toEmail,
      displayName: input.displayName,
      localName: input.localName,
      productName: input.productName,
      marginPct: input.marginPct.toFixed(2),
      minMarginPct: input.minMarginPct.toFixed(2),
    })
    return
  }

  // TODO: Integrar proveedor real (Resend) en producción.
}
