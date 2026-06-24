import { PlanType, SubStatus } from '@prisma/client'

import { env } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import {
  buildPlanCheckoutUrl,
  createPreapproval,
  findPreapprovalsByExternalReference,
  getPreapproval,
  getPreapprovalSafe,
  isMpConfigured,
  isMpTestMode,
  mpRecurringStartDate,
  resolvePreapprovalCheckoutUrl,
} from './mercadopago.service.js'
import { AppError } from '../utils/AppError.js'

const PRO_REASON = 'PreciosYa Pro — suscripción mensual'

function primaryFrontendUrl(): string {
  const preferred = env.FRONTEND_URL.find((url) => url.includes('preciosya.vercel.app'))
  return preferred ?? env.FRONTEND_URL[0] ?? 'http://localhost:5173'
}

function mpNotificationUrl(): string | undefined {
  const raw = env.MP_NOTIFICATION_URL?.trim()
  return raw && raw.length > 0 ? raw : undefined
}

/** En sandbox MP no usar el email real del usuario: MP pre-asigna payer y bloquea el login del comprador de prueba. */
const MP_SANDBOX_PAYER_EMAIL = 'preciosya.sandbox.buyer@gmail.com'

function resolvePayerEmail(userEmail: string): string {
  if (isMpTestMode()) {
    return env.MP_TEST_PAYER_EMAIL?.trim() || MP_SANDBOX_PAYER_EMAIL
  }
  return userEmail
}

function addOneMonth(from: Date): Date {
  const next = new Date(from)
  next.setMonth(next.getMonth() + 1)
  return next
}

function mapMpStatusToSubStatus(mpStatus: string): SubStatus {
  switch (mpStatus) {
    case 'authorized':
      return SubStatus.ACTIVE
    case 'cancelled':
      return SubStatus.CANCELLED
    case 'paused':
      return SubStatus.CANCELLED
    case 'pending':
      return SubStatus.PENDING
    default:
      return SubStatus.EXPIRED
  }
}

export async function getSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true, email: true },
  })
  if (!user) {
    throw new AppError({ statusCode: 404, message: 'Usuario no encontrado', code: 'NOT_FOUND' })
  }

  const latest = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return {
    plan: user.plan,
    planExpiresAt: user.planExpiresAt?.toISOString() ?? null,
    mpConfigured: isMpConfigured(),
    mpTestMode: isMpTestMode(),
    proAmountArs: env.MP_PRO_AMOUNT_ARS,
    subscription: latest
      ? {
          id: latest.id,
          status: latest.status,
          mpSubscriptionId: latest.mpSubscriptionId,
          amountArs: Number(latest.amountArs),
          startedAt: latest.startedAt.toISOString(),
          expiresAt: latest.expiresAt?.toISOString() ?? null,
        }
      : null,
  }
}

export async function createProCheckout(userId: string, email: string) {
  if (!isMpConfigured()) {
    throw new AppError({
      statusCode: 503,
      message: 'Pagos con Mercado Pago no disponibles todavía',
      code: 'MP_NOT_CONFIGURED',
    })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError({ statusCode: 404, message: 'Usuario no encontrado', code: 'NOT_FOUND' })
  }
  if (user.plan === PlanType.PRO || user.plan === PlanType.AGENCY) {
    throw new AppError({
      statusCode: 400,
      message: 'Ya tenés un plan activo superior a Free',
      code: 'PLAN_ALREADY_ACTIVE',
    })
  }

  const frontend = primaryFrontendUrl()
  const notificationUrl = mpNotificationUrl()
  const payerEmail = resolvePayerEmail(email)

  // Sandbox: checkout por plan MP (evita payer pre-asignado que rompe login test)
  const planId = env.MP_PREAPPROVAL_PLAN_ID?.trim()
  if (isMpTestMode() && planId) {
    await prisma.subscription.create({
      data: {
        userId,
        plan: PlanType.PRO,
        status: SubStatus.PENDING,
        mpSubscriptionId: null,
        amountArs: env.MP_PRO_AMOUNT_ARS,
        billingCycle: 'monthly',
      },
    })
    return {
      preapprovalId: planId,
      checkoutUrl: buildPlanCheckoutUrl(planId, userId),
      status: 'pending',
      payerEmail,
      testMode: true,
      sandboxHint: 'sandbox_plan_checkout',
    }
  }

  // En sandbox sin plan: checkout directo (legacy)
  if (!isMpTestMode()) {
    const existingPending = await prisma.subscription.findFirst({
      where: { userId, status: SubStatus.PENDING, mpSubscriptionId: { not: null } },
      orderBy: { createdAt: 'desc' },
    })
    if (existingPending?.mpSubscriptionId) {
      const existing = await getPreapprovalSafe(existingPending.mpSubscriptionId)
      const payerMatches =
        !existing?.payer_email ||
        existing.payer_email.toLowerCase() === payerEmail.toLowerCase()
      if (existing && existing.status === 'pending' && payerMatches) {
        return {
          preapprovalId: existing.id,
          checkoutUrl: await resolvePreapprovalCheckoutUrl(existing),
          status: existing.status,
          payerEmail,
          testMode: isMpTestMode(),
          sandboxHint: isMpTestMode() ? 'sandbox_guest_checkout' : undefined,
        }
      }
    }
  }

  const preapproval = await createPreapproval({
    reason: PRO_REASON,
    externalReference: userId,
    payerEmail,
    autoRecurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: env.MP_PRO_AMOUNT_ARS,
      currency_id: 'ARS',
      start_date: mpRecurringStartDate(),
    },
    backUrl: `${frontend}/settings?tab=plan&checkout=success`,
    ...(notificationUrl ? { notificationUrl } : {}),
  })

  await prisma.subscription.create({
    data: {
      userId,
      plan: PlanType.PRO,
      status: SubStatus.PENDING,
      mpSubscriptionId: preapproval.id,
      amountArs: env.MP_PRO_AMOUNT_ARS,
      billingCycle: 'monthly',
    },
  })

  return {
    preapprovalId: preapproval.id,
    checkoutUrl: await resolvePreapprovalCheckoutUrl(preapproval),
    status: preapproval.status,
    payerEmail,
    testMode: isMpTestMode(),
    sandboxHint: isMpTestMode()
      ? 'sandbox_guest_checkout'
      : undefined,
  }
}

async function activateProFromPreapproval(
  userId: string,
  preapprovalId: string,
  mpStatus: string,
  nextPaymentDate?: string,
) {
  const subStatus = mapMpStatusToSubStatus(mpStatus)
  const expiresAt = nextPaymentDate ? new Date(nextPaymentDate) : addOneMonth(new Date())

  await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: { userId, mpSubscriptionId: preapprovalId },
      data: {
        status: subStatus,
        ...(subStatus === SubStatus.ACTIVE ? { startedAt: new Date(), expiresAt } : {}),
      },
    })
    if (subStatus === SubStatus.ACTIVE) {
      await tx.user.update({
        where: { id: userId },
        data: { plan: PlanType.PRO, planExpiresAt: expiresAt },
      })
    }
  })
}

export async function syncPendingSubscription(userId: string) {
  const pending = await prisma.subscription.findFirst({
    where: { userId, status: SubStatus.PENDING },
    orderBy: { createdAt: 'desc' },
  })

  if (!pending) {
    return getSubscriptionStatus(userId)
  }

  // Plan checkout: buscar suscripción creada por MP con external_reference = userId
  if (!pending.mpSubscriptionId) {
    const matches = await findPreapprovalsByExternalReference(userId)
    const authorized = matches.find((row) => row.status === 'authorized')
    const latest = matches[0]
    const mpId = authorized?.id ?? latest?.id
    if (mpId) {
      await prisma.subscription.update({
        where: { id: pending.id },
        data: { mpSubscriptionId: mpId },
      })
      pending.mpSubscriptionId = mpId
    }
  }

  if (!pending.mpSubscriptionId) {
    return getSubscriptionStatus(userId)
  }

  const mp = await getPreapproval(pending.mpSubscriptionId)
  if (mp.status === 'authorized') {
    await activateProFromPreapproval(userId, pending.mpSubscriptionId, mp.status, mp.next_payment_date)
  } else if (mp.status === 'cancelled' || mp.status === 'paused') {
    await prisma.subscription.update({
      where: { id: pending.id },
      data: { status: SubStatus.CANCELLED, cancelledAt: new Date() },
    })
  }

  return getSubscriptionStatus(userId)
}

type MpWebhookBody = {
  type?: string
  topic?: string
  entity?: string
  action?: string
  id?: string | number
  data?: { id?: string | number }
}

function resolveWebhookTopic(body: MpWebhookBody): string | undefined {
  if (body.type) return body.type
  if (body.topic) return body.topic
  if (body.entity === 'preapproval') return 'subscription_preapproval'
  return undefined
}

function resolveWebhookResourceId(body: MpWebhookBody): string | undefined {
  const raw = body.data?.id ?? body.id
  if (raw === undefined || raw === null) return undefined
  return String(raw)
}

export async function handleMercadoPagoWebhook(body: MpWebhookBody) {
  const topic = resolveWebhookTopic(body)
  const resourceId = resolveWebhookResourceId(body)
  if (!resourceId) return { handled: false as const, reason: 'missing_id' }

  const isPreapprovalTopic =
    topic === 'subscription_preapproval' ||
    topic === 'preapproval' ||
    body.entity === 'preapproval'

  // Pagos recurrentes: ignorar en v1 (activación vía preapproval authorized)
  if (
    topic === 'subscription_authorized_payment' ||
    topic === 'payment' ||
    body.entity === 'authorized_payment'
  ) {
    return { handled: true as const, action: 'ignored_payment_event', resourceId }
  }

  if (isPreapprovalTopic) {
    // Simulación de MP usa id ficticio (ej. 123456) — responder 200 sin error
    const mp = await getPreapprovalSafe(resourceId)
    if (!mp) {
      return {
        handled: false as const,
        reason: 'preapproval_not_found',
        resourceId,
      }
    }

    const userId = mp.external_reference
    if (!userId) return { handled: false as const, reason: 'missing_external_reference' }

    if (mp.status === 'authorized') {
      await activateProFromPreapproval(userId, mp.id, mp.status, mp.next_payment_date)
      return { handled: true as const, action: 'activated_pro', userId }
    }

    if (mp.status === 'cancelled' || mp.status === 'paused') {
      await prisma.subscription.updateMany({
        where: { mpSubscriptionId: mp.id },
        data: { status: SubStatus.CANCELLED, cancelledAt: new Date() },
      })
      return { handled: true as const, action: 'cancelled', userId }
    }

    return { handled: true as const, action: 'ignored_status', status: mp.status }
  }

  return { handled: false as const, reason: 'unsupported_topic', topic }
}
