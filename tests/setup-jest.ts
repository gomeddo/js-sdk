import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks()

// Node.js 18+ has a native fetch that can't be overwritten by global assignment.
// jest-fetch-mock sets global.fetch but the native fetch is still used,
// so we need to explicitly override.
Object.defineProperty(globalThis, 'fetch', {
  value: fetchMock,
  writable: true,
  configurable: true
})
