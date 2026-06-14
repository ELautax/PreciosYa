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
  const isTest = env.MP_ACCESS_TOKEN?.startsWith('TEST-') ?? true
  const url = isTest ? preapproval.sandbox_init_point : preapproval.init_point
  if (!url) {
    throw new AppError({
      statusCode: 502,
      message: 'Mercado Pago no devolvió URL de checkout',
      code: 'MP_NO_INIT_POINT',
    })
  }
  return url
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

export function isMpConfigured(): boolean {
  return Boolean(env.MP_ACCESS_TOKEN?.trim())
}
