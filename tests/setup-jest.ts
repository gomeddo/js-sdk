import { enableFetchMocks } from 'jest-fetch-mock'
import { webcrypto } from 'crypto'
enableFetchMocks()

// Node.js 18+ has a native fetch that can't be overwritten by global assignment.
// jest-fetch-mock sets global.fetch but the native fetch is still used,
// so we need to explicitly override.
Object.defineProperty(globalThis, 'fetch', {
  value: fetchMock,
  writable: true,
  configurable: true
})

// Node 18 has no global `crypto`; expose Node's implementation so the request id header
// is present in every test run, matching what browsers and Node 19+ do natively.
if (typeof globalThis.crypto?.randomUUID !== 'function') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true
  })
}
