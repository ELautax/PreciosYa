import { env } from '../config/env.js'

export async function sendWelcomeEmail(toEmail: string, displayName: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV !== 'production') {
      console.info(`[email] bienvenida (sin RESEND_API_KEY): ${toEmail} (${displayName})`)
    }
    return
  }
}
