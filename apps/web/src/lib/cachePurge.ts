const BUILD_KEY = 'preciosya-build-id'

export async function purgeStaleAppCache(): Promise<boolean> {
  const current = __PY_BUILD_ID__
  const previous = localStorage.getItem(BUILD_KEY)
  if (previous === current) return false

  localStorage.setItem(BUILD_KEY, current)

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }

  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }

  return Boolean(previous)
}
