import { openDB } from 'idb'

const DB_NAME = 'preciosya-offline'
const DB_VERSION = 1
const STORE_SNAPSHOTS = 'snapshots'

type SnapshotRecord = {
  key: string
  value: unknown
  updatedAt: string
}

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
        db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'key' })
      }
    },
  })
}

export async function saveOfflineSnapshot(key: string, value: unknown): Promise<void> {
  const db = await getDb()
  const row: SnapshotRecord = {
    key,
    value,
    updatedAt: new Date().toISOString(),
  }
  await db.put(STORE_SNAPSHOTS, row)
}

export async function readOfflineSnapshot<T>(key: string): Promise<T | null> {
  const db = await getDb()
  const row = (await db.get(STORE_SNAPSHOTS, key)) as SnapshotRecord | undefined
  if (!row) return null
  return row.value as T
}
