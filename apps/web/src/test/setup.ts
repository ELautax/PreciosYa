import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { server } from './server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  server.resetHandlers()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})
