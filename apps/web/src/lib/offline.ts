import type { AxiosInstance } from 'axios'
import { openDB } from 'idb'

const DB_NAME = 'preciosya-offline'
const DB_VERSION = 2
const STORE_SNAPSHOTS = 'snapshots'
const STORE_OUTBOX = 'outbox'

type SnapshotRecord = {
  key: string
  value: unknown
  updatedAt: string
}

export type ProductCreateOfflinePayload = {
  localId: string
  name: string
  unit?: string | undefined
  barcode?: string | null | undefined
  cost: number
  marginPct: number
  categoryId?: string | null | undefined
  notes?: string | null | undefined
}

export type ProductUpdateOfflinePayload = {
  localId: string
  productId: string
  body: Partial<{
    name: string
    unit: string
    barcode: string | null
    cost: number
    marginPct: number
    categoryId: string | null
    notes: string | null
  }>
}

export type ProductBulkOfflinePayload = {
  localId: string
  increasePct: number
  categoryId?: string | undefined
}

export type CategoryCreateOfflinePayload = {
  localId: string
  name: string
  colorHex?: string | null | undefined
  preferredIndex?: 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS'
}

export type CategoryUpdateOfflinePayload = {
  localId: string
  categoryId: string
  body: Partial<{
    name: string
    colorHex: string | null
    preferredIndex: 'IPC_INDEC' | 'IPC_INDEC_ALIMENTOS'
  }>
}

export type OfflineOutboxEnvelope =
  | { kind: 'product:create'; payload: ProductCreateOfflinePayload }
  | { kind: 'product:update'; payload: ProductUpdateOfflinePayload }
  | { kind: 'product:delete'; payload: { localId: string; productId: string } }
  | { kind: 'product:bulk'; payload: ProductBulkOfflinePayload }
  | { kind: 'category:create'; payload: CategoryCreateOfflinePayload }
  | { kind: 'category:update'; payload: CategoryUpdateOfflinePayload }
  | { kind: 'category:delete'; payload: { localId: string; categoryId: string } }

export const offlineQueuedSentinel = Symbol('offlineQueued')

export type OfflineQueued = { readonly [offlineQueuedSentinel]: true }

export function isOfflineQueued(val: unknown): val is OfflineQueued {
  return (
    typeof val === 'object' &&
    val !== null &&
    offlineQueuedSentinel in (val as object) &&
    (val as OfflineQueued)[offlineQueuedSentinel] === true
  )
}

export function markOfflineQueued(): OfflineQueued {
  return { [offlineQueuedSentinel]: true } as OfflineQueued
}

async function openOfflineDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2 && !db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
        db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'key' })
      }
      if (oldVersion < 2 && !db.objectStoreNames.contains(STORE_OUTBOX)) {
        db.createObjectStore(STORE_OUTBOX, { autoIncrement: true })
      }
    },
  })
}

export async function saveOfflineSnapshot(key: string, value: unknown): Promise<void> {
  const db = await openOfflineDb()
  const row: SnapshotRecord = {
    key,
    value,
    updatedAt: new Date().toISOString(),
  }
  await db.put(STORE_SNAPSHOTS, row)
}

export async function readOfflineSnapshot<T>(key: string): Promise<T | null> {
  const db = await openOfflineDb()
  const row = (await db.get(STORE_SNAPSHOTS, key)) as SnapshotRecord | undefined
  if (!row) return null
  return row.value as T
}

export async function enqueueOfflineOperation(
  envelope: OfflineOutboxEnvelope,
): Promise<void> {
  const db = await openOfflineDb()
  await db.add(STORE_OUTBOX, envelope)
}

export async function processOneOutboxEnvelope(
  api: AxiosInstance,
  envelope: OfflineOutboxEnvelope,
): Promise<void> {
  switch (envelope.kind) {
    case 'product:create':
      await api.post('/api/products', envelope.payload)
      break
    case 'product:update':
      await api.put(`/api/products/${envelope.payload.productId}`, envelope.payload.body)
      break
    case 'product:delete':
      await api.delete(`/api/products/${envelope.payload.productId}`)
      break
    case 'product:bulk':
      await api.put('/api/products/bulk-update', {
        localId: envelope.payload.localId,
        increasePct: envelope.payload.increasePct,
        ...(envelope.payload.categoryId
          ? { categoryId: envelope.payload.categoryId }
          : {}),
      })
      break
    case 'category:create': {
      const { localId, ...rest } = envelope.payload
      await api.post('/api/categories', { localId, ...rest })
      break
    }
    case 'category:update':
      await api.put(`/api/categories/${envelope.payload.categoryId}`, envelope.payload.body)
      break
    case 'category:delete':
      await api.delete(`/api/categories/${envelope.payload.categoryId}`)
      break
    default:
      break
  }
}

/** Drena la cola en orden FIFO: una solicitud tras otra hasta un fallo (se conserva ese ítem y el resto). */
export async function drainOfflineOutboxSequentially(
  api: AxiosInstance,
): Promise<{ processed: number }> {
  const db = await openOfflineDb()
  const keys = await db.getAllKeys(STORE_OUTBOX)
  let processed = 0
  for (const key of keys) {
    const envelope = await db.get(STORE_OUTBOX, key as IDBValidKey)
    if (!envelope) continue
    try {
      await processOneOutboxEnvelope(api, envelope as OfflineOutboxEnvelope)
      await db.delete(STORE_OUTBOX, key as IDBValidKey)
      processed++
    } catch {
      break
    }
  }
  return { processed }
}
