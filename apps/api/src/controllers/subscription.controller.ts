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

/** MP exige HTTP 2xx; nunca propagar error por ids de prueba o recursos inexistentes. */
export async function postWebhook(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>
  const q = req.query
  const queryTopic =
    typeof q.type === 'string'
      ? q.type
      : typeof q.topic === 'string'
        ? q.topic
        : undefined
  const queryId =
    typeof q.id === 'string'
      ? q.id
      : typeof q['data.id'] === 'string'
        ? q['data.id']
        : undefined

  const dataId =
    body.data && typeof body.data === 'object' && body.data !== null && 'id' in body.data
      ? (body.data as { id?: string | number }).id
      : undefined

  const result = await handleMercadoPagoWebhook({
    type: typeof body.type === 'string' ? body.type : queryTopic,
    topic: typeof body.topic === 'string' ? body.topic : queryTopic,
    entity: typeof body.entity === 'string' ? body.entity : undefined,
    action: typeof body.action === 'string' ? body.action : undefined,
    id: typeof body.id === 'string' || typeof body.id === 'number' ? body.id : queryId,
    data: dataId !== undefined ? { id: dataId } : queryId ? { id: queryId } : undefined,
  })
  sendSuccess(res, result)
}

/** IPN legacy: GET ?topic=…&id=… */
export async function getWebhook(req: Request, res: Response): Promise<void> {
  const topic = typeof req.query.topic === 'string' ? req.query.topic : undefined
  const id = typeof req.query.id === 'string' ? req.query.id : undefined
  const result = await handleMercadoPagoWebhook({
    topic,
    type: topic,
    data: id ? { id } : undefined,
    id,
  })
  sendSuccess(res, result)
}
