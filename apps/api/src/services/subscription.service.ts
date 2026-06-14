import { PlanType, SubStatus } from '@prisma/client'

import { env } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import {
  createPreapproval,
  getPreapproval,
  isMpConfigured,
  mpCheckoutUrl,
} from './mercadopago.service.js'
import { AppError } from '../utils/AppError.js'

const PRO_REASON = 'PreciosYa Pro — suscripción mensual'

function primaryFrontendUrl(): string {
  return env.FRONTEND_URL[0] ?? 'http://localhost:5173'
}

function mpNotificationUrl(): string | undefined {
  const raw = env.MP_NOTIFICATION_URL?.trim()
  return raw && raw.length > 0 ? raw : undefined
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
  const preapproval = await createPreapproval({
    reason: PRO_REASON,
    externalReference: userId,
    payerEmail: email,
    autoRecurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: env.MP_PRO_AMOUNT_ARS,
      currency_id: 'ARS',
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
    checkoutUrl: mpCheckoutUrl(preapproval),
    status: preapproval.status,
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
    where: { userId, status: SubStatus.PENDING, mpSubscriptionId: { not: null } },
    orderBy: { createdAt: 'desc' },
  })

  if (!pending?.mpSubscriptionId) {
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
  action?: string
  data?: { id?: string }
}

export async function handleMercadoPagoWebhook(body: MpWebhookBody) {
  const topic = body.type ?? body.topic
  const resourceId = body.data?.id
  if (!resourceId) return { handled: false as const, reason: 'missing_id' }

  if (topic === 'subscription_preapproval' || topic === 'preapproval') {
    const mp = await getPreapproval(String(resourceId))
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
