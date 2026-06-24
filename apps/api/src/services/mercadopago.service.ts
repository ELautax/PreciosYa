import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

const MP_API_BASE = 'https://api.mercadopago.com'

export type MpAutoRecurring = {
  frequency: number
  frequency_type: 'days' | 'months'
  transaction_amount: number
  currency_id: string
  start_date?: string
  end_date?: string
}

export type MpPreapproval = {
  id: string
  status: string
  reason?: string
  external_reference?: string
  payer_email?: string
  init_point?: string
  sandbox_init_point?: string
  next_payment_date?: string
  auto_recurring?: {
    transaction_amount?: number
    currency_id?: string
    frequency?: number
    frequency_type?: string
  }
}

export type CreatePreapprovalInput = {
  reason: string
  externalReference: string
  payerEmail: string
  autoRecurring: MpAutoRecurring
  backUrl: string
  notificationUrl?: string
  preapprovalPlanId?: string
}

function mpHeaders(): HeadersInit {
  if (!env.MP_ACCESS_TOKEN) {
    throw new AppError({
      statusCode: 503,
      message: 'Mercado Pago no está configurado',
      code: 'MP_NOT_CONFIGURED',
    })
  }
  return {
    Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

async function parseMpError(res: Response): Promise<never> {
  let detail = res.statusText
  try {
    const body = (await res.json()) as { message?: string; cause?: Array<{ description?: string }> }
    detail = body.message ?? body.cause?.[0]?.description ?? detail
  } catch {
    // respuesta no JSON
  }
  throw new AppError({
    statusCode: 502,
    message: `Mercado Pago: ${detail}`,
    code: 'MP_API_ERROR',
  })
}

export function mpCheckoutUrl(preapproval: MpPreapproval): string {
  const url = preapproval.sandbox_init_point ?? preapproval.init_point
  if (url) return url

  if (preapproval.id) {
    return `https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=${preapproval.id}`
  }

  throw new AppError({
    statusCode: 502,
    message: 'Mercado Pago no devolvió URL de checkout',
    code: 'MP_NO_INIT_POINT',
  })
}

/** Checkout por plan (recomendado en sandbox): MP crea la suscripción al pagar. */
export function buildPlanCheckoutUrl(planId: string, userId: string): string {
  const params = new URLSearchParams({
    preapproval_plan_id: planId,
    external_reference: userId,
  })
  return `https://www.mercadopago.com.ar/subscriptions/checkout?${params.toString()}`
}

type PreapprovalSearchResponse = {
  results?: Array<{ id: string; status: string; external_reference?: string }>
}

export async function findPreapprovalsByExternalReference(
  externalReference: string,
): Promise<Array<{ id: string; status: string }>> {
  const res = await fetch(
    `${MP_API_BASE}/preapproval/search?external_reference=${encodeURIComponent(externalReference)}`,
    { headers: mpHeaders() },
  )
  if (!res.ok) await parseMpError(res)
  const body = (await res.json()) as PreapprovalSearchResponse
  return (body.results ?? []).map((row) => ({ id: row.id, status: row.status }))
}

export async function resolvePreapprovalCheckoutUrl(
  preapproval: MpPreapproval,
): Promise<string> {
  try {
    return mpCheckoutUrl(preapproval)
  } catch {
    const refreshed = await getPreapprovalSafe(preapproval.id)
    if (refreshed) return mpCheckoutUrl(refreshed)
    throw new AppError({
      statusCode: 502,
      message: 'Mercado Pago no devolvió URL de checkout',
      code: 'MP_NO_INIT_POINT',
    })
  }
}

export async function createPreapproval(input: CreatePreapprovalInput): Promise<MpPreapproval> {
  const res = await fetch(`${MP_API_BASE}/preapproval`, {
    method: 'POST',
    headers: mpHeaders(),
    body: JSON.stringify({
      reason: input.reason,
      external_reference: input.externalReference,
      payer_email: input.payerEmail,
      auto_recurring: input.autoRecurring,
      back_url: input.backUrl,
      status: 'pending',
      ...(input.notificationUrl ? { notification_url: input.notificationUrl } : {}),
    }),
  })

  if (!res.ok) await parseMpError(res)
  return (await res.json()) as MpPreapproval
}

export async function getPreapproval(preapprovalId: string): Promise<MpPreapproval> {
  const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
    headers: mpHeaders(),
  })
  if (!res.ok) await parseMpError(res)
  return (await res.json()) as MpPreapproval
}

/** Para webhooks: no romper con 502 si el id es de prueba o ya no existe en MP. */
export async function getPreapprovalSafe(preapprovalId: string): Promise<MpPreapproval | null> {
  try {
    return await getPreapproval(preapprovalId)
  } catch {
    return null
  }
}

export function isMpConfigured(): boolean {
  return Boolean(env.MP_ACCESS_TOKEN?.trim())
}

export function isMpTestMode(): boolean {
  return env.MP_ACCESS_TOKEN?.trim().startsWith('TEST-') ?? false
}

/** Fecha de inicio para auto_recurring (MP exige ISO futuro). */
export function mpRecurringStartDate(): string {
  const start = new Date()
  start.setMinutes(start.getMinutes() + 10)
  return start.toISOString()
}
