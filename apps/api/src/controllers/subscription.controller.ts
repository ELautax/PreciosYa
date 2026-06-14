import type { Request, Response } from 'express'

import {
  createProCheckout,
  getSubscriptionStatus,
  handleMercadoPagoWebhook,
  syncPendingSubscription,
} from '../services/subscription.service.js'
import { sendSuccess } from '../utils/response.js'

export async function getStatus(req: Request, res: Response): Promise<void> {
  const data = await getSubscriptionStatus(req.user!.id)
  sendSuccess(res, data)
}

export async function postCheckout(req: Request, res: Response): Promise<void> {
  const data = await createProCheckout(req.user!.id, req.user!.email)
  sendSuccess(res, data)
}

export async function postSync(req: Request, res: Response): Promise<void> {
  const data = await syncPendingSubscription(req.user!.id)
  sendSuccess(res, data)
}

export async function postWebhook(req: Request, res: Response): Promise<void> {
  const result = await handleMercadoPagoWebhook(req.body as Record<string, unknown>)
  sendSuccess(res, result)
}
