import { Environment } from '../../src/index'
import GoMeddoAPI, { RequestError, REQUEST_ID_HEADER } from '../../src/api/gomeddo-api-requests'
import AvailabilityTimeSlotRequest from '../../src/api/request-bodies/availability-request'
import ReservationPriceCalculationRequest from '../../src/api/request-bodies/reservation-price-calculation-request'
import ContextualPriceCalculationRequest from '../../src/api/request-bodies/contextual-price-calculation-request'
import { ReservationProcessRequest } from '../../src/api/request-bodies/reservation-save-request'
import { getAvailabilityResponse, getAvailabilitySlot } from '../__utils__/availability-responses'
import TimeSlotRequestBody from '../../src/api/request-bodies/timeslots-request-body'
import { ReservationTimeSlot } from '../../src/time-slots/reservation-time-slot'
import { dummyId0 } from '../__utils__/salesforce-dummy-ids'

beforeEach(() => {
  fetchMock.resetMocks()
})

test('url and body are constructed correctly for saveReservation', async () => {
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const mock = fetchMock.once('{}')
  const saveRequest = new ReservationProcessRequest({}, null, null, [])
  const result = await api.saveReservation(saveRequest)
  expect(result).toStrictEqual({})
  expect(mock).toHaveBeenCalled()
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25LP/v1/reservations',
    {
      method: 'POST',
      body: JSON.stringify(saveRequest),
      headers: { Authorization: 'Bearer YOUR_API_KEY', 'X-GoMeddo-Request-Id': expect.any(String) }
    }
  )
})

test('the get availabilities makes the correct request', async () => {
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const mock = fetchMock.once(
    JSON.stringify(
      getAvailabilityResponse(['1', '2'], [getAvailabilitySlot(1, 1, 10, 12, 'Open')])
    )
  )
  const requestBody = new AvailabilityTimeSlotRequest(
    new Date(Date.UTC(2020, 0, 1)),
    new Date(Date.UTC(2020, 0, 10)),
    ['Id 1', 'Id 2']
  )
  await api.getAvailability(requestBody)
  expect(mock).toHaveBeenCalled()
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/availability',
    {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { Authorization: 'Bearer YOUR_API_KEY', 'X-GoMeddo-Request-Id': expect.any(String) }
    }
  )
})

test('price calculation makes the correct request', async () => {
  const mock = fetchMock.once(JSON.stringify({
    reservation: {},
    serviceReservations: [],
    serviceCosts: 0
  }))
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const body = new ReservationPriceCalculationRequest({}, [], 0)
  await api.calculatePrice(body)
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/priceCalculation',
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { Authorization: 'Bearer YOUR_API_KEY', 'X-GoMeddo-Request-Id': expect.any(String) }
    }
  )
})

test('price calculation includes relatedRecords in the request body', async () => {
  const mock = fetchMock.once(JSON.stringify({
    reservation: {},
    serviceReservations: [],
    serviceCosts: 0,
    relatedRecords: {}
  }))
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const relatedRecords = {
    Custom_Junction__c: [{ Custom_Field__c: 'value', attributes: { type: 'Custom_Junction__c' } }]
  }
  const body = new ReservationPriceCalculationRequest({}, [], 0, relatedRecords)
  await api.calculatePrice(body)
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/priceCalculation',
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { Authorization: 'Bearer YOUR_API_KEY', 'X-GoMeddo-Request-Id': expect.any(String) }
    }
  )
  const sentBody = JSON.parse((mock as any).mock.calls[0][1].body)
  expect(sentBody.relatedRecords).toStrictEqual(relatedRecords)
})

test('contextual price calculation makes the correct request', async () => {
  const mock = fetchMock.once(JSON.stringify({ B25__Subtotal__c: 100 }))
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const body = new ContextualPriceCalculationRequest({ reservation: {}, childRecords: {} })
  const result = await api.calculateContextualPrice(body)
  expect(result).toStrictEqual({ B25__Subtotal__c: 100 })
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/contextualPriceCalculation',
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { Authorization: 'Bearer YOUR_API_KEY', 'X-GoMeddo-Request-Id': expect.any(String) }
    }
  )
})

test('getTimeSlots makes the correct request and processes response correctly', async () => {
  const mock = fetchMock.once(JSON.stringify({
    timeSlots: [
      {
        startDatetime: '2024-01-01T09:00:00Z',
        endDatetime: '2024-01-01T10:00:00Z',
        reservations: [
          {
            B25__Resource__c: dummyId0
          }
        ]
      }
    ]
  }))
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const requestBody = new TimeSlotRequestBody('2024-01-01T00:00:00Z', '2024-01-01T23:59:59Z')
  const timeSlots = await api.getTimeSlots(requestBody)
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/timeSlots',
    {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { Authorization: 'Bearer YOUR_API_KEY', 'X-GoMeddo-Request-Id': expect.any(String) }
    }
  )

  expect(timeSlots).toBeInstanceOf(Array)
  expect(timeSlots[0]).toBeInstanceOf(ReservationTimeSlot)
})

test('a failed request exposes the HTTP status and reads a Salesforce array error body', async () => {
  fetchMock.once(JSON.stringify([{ errorCode: 'NOT_FOUND', message: 'Could not find a match for URL' }]), { status: 404 })
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const failure = await api.calculateContextualPrice({ isParent: false, beingProcessed: { reservation: {}, childRecords: {} }, collection: { parentReservation: { reservation: {}, childRecords: {} }, childReservations: [] } } as any).catch(e => e)
  expect(failure).toBeInstanceOf(RequestError)
  expect(failure.status).toBe(404)
  expect(failure.message).toBe('Could not find a match for URL')
})

test('a failed request still reads the GoMeddo error body', async () => {
  fetchMock.once(JSON.stringify({ devMessage: 'dev', userMessage: 'Something went wrong.', errorCode: 4 }), { status: 400 })
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const failure = await api.calculateContextualPrice({ isParent: false, beingProcessed: { reservation: {}, childRecords: {} }, collection: { parentReservation: { reservation: {}, childRecords: {} }, childReservations: [] } } as any).catch(e => e)
  expect(failure).toBeInstanceOf(RequestError)
  expect(failure.status).toBe(400)
  expect(failure.message).toBe('Something went wrong.')
})

const priceRequest = { isParent: false, beingProcessed: { reservation: {}, childRecords: {} }, collection: { parentReservation: { reservation: {}, childRecords: {} }, childReservations: [] } } as any

test('a failed request exposes the proxy request id from the response header', async () => {
  fetchMock.once(JSON.stringify({ userMessage: 'Something went wrong.' }), { status: 400, headers: { [REQUEST_ID_HEADER]: 'req-123' } })
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const failure = await api.calculateContextualPrice(priceRequest).catch(e => e)
  expect(failure).toBeInstanceOf(RequestError)
  expect(failure.requestId).toBe('req-123')
})

const sentRequestId = (): string => (fetchMock.mock.calls[0] as any)[1].headers[REQUEST_ID_HEADER]

test('a failed request without the response header falls back to the request id that was sent', async () => {
  fetchMock.once(JSON.stringify({ userMessage: 'Something went wrong.' }), { status: 400 })
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const failure = await api.calculateContextualPrice(priceRequest).catch(e => e)
  expect(failure).toBeInstanceOf(RequestError)
  expect(sentRequestId()).toEqual(expect.any(String))
  expect(failure.requestId).toBe(sentRequestId())
})

test('a gateway error with an HTML body and no response header keeps the sent request id', async () => {
  fetchMock.once('<html>Bad Gateway</html>', { status: 502 })
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const failure = await api.calculateContextualPrice(priceRequest).catch(e => e)
  expect(failure).toBeInstanceOf(RequestError)
  expect(failure.status).toBe(502)
  expect(failure.message).toBe('Request failed')
  expect(failure.requestId).toBe(sentRequestId())
})

test('a network failure is wrapped in a RequestError carrying the sent request id', async () => {
  fetchMock.mockRejectOnce(new TypeError('Failed to fetch'))
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const failure = await api.calculateContextualPrice(priceRequest).catch(e => e)
  expect(failure).toBeInstanceOf(RequestError)
  expect(failure.status).toBe(0)
  expect(failure.message).toBe('Network request failed')
  expect(failure.apiError.devMessage).toBe('Failed to fetch')
  expect(failure.requestId).toBe(sentRequestId())
})

test('a proxy error body reports its first error as the message', async () => {
  fetchMock.once(JSON.stringify({ errors: ['Incorrect authentication credentials.'] }), { status: 401 })
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const failure = await api.calculateContextualPrice(priceRequest).catch(e => e)
  expect(failure).toBeInstanceOf(RequestError)
  expect(failure.status).toBe(401)
  expect(failure.message).toBe('Incorrect authentication credentials.')
})

test('a failed request with a non-JSON body still yields a RequestError with a string message', async () => {
  const html = '<html>' + 'x'.repeat(600) + '</html>'
  fetchMock.once(html, { status: 502, headers: { [REQUEST_ID_HEADER]: 'req-502' } })
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const failure = await api.calculateContextualPrice(priceRequest).catch(e => e)
  expect(failure).toBeInstanceOf(RequestError)
  expect(failure).not.toBeInstanceOf(SyntaxError)
  expect(failure.message).toBe('Request failed')
  expect(failure.status).toBe(502)
  expect(failure.requestId).toBe('req-502')
  expect(failure.apiError.userMessage).toBe('Request failed')
  expect(failure.apiError.devMessage).toBe(html.slice(0, 500))
  expect(failure.apiError.devMessage).toHaveLength(500)
})

test('searchReservations throws a RequestError on a failed response', async () => {
  fetchMock.once(JSON.stringify({ userMessage: 'No access.' }), { status: 403, headers: { [REQUEST_ID_HEADER]: 'req-403' } })
  const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
  const failure = await api.searchReservations(new Set(), null, null, undefined, new Set(['Id'])).catch(e => e)
  expect(failure).toBeInstanceOf(RequestError)
  expect(failure.status).toBe(403)
  expect(failure.requestId).toBe('req-403')
})

test('RequestError keeps working without a request id', () => {
  const error = new RequestError({ userMessage: 'Nope' } as any, 400)
  expect(error.message).toBe('Nope')
  expect(error.status).toBe(400)
  expect(error.requestId).toBeUndefined()
})

describe('request id header', () => {
  const originalCrypto = globalThis.crypto

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, writable: true, configurable: true })
  })

  test('is sent as a UUID when crypto.randomUUID is available', async () => {
    Object.defineProperty(globalThis, 'crypto', { value: { randomUUID: () => 'generated-uuid' }, writable: true, configurable: true })
    fetchMock.once('{}')
    const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
    await api.saveReservation(new ReservationProcessRequest({}, null, null, []))
    const [, init] = fetchMock.mock.calls[0] as any
    expect(init.headers).toStrictEqual({ Authorization: 'Bearer YOUR_API_KEY', [REQUEST_ID_HEADER]: 'generated-uuid' })
  })

  test('is omitted when crypto.randomUUID is not available', async () => {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, writable: true, configurable: true })
    fetchMock.once('{}')
    const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
    await api.saveReservation(new ReservationProcessRequest({}, null, null, []))
    const [, init] = fetchMock.mock.calls[0] as any
    expect(init.headers).toStrictEqual({ Authorization: 'Bearer YOUR_API_KEY' })
  })

  test('leaves requestId undefined when none was sent and the response carries none', async () => {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, writable: true, configurable: true })
    fetchMock.once(JSON.stringify({ userMessage: 'Something went wrong.' }), { status: 400 })
    const api = new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION)
    const failure = await api.calculateContextualPrice(priceRequest).catch(e => e)
    expect(failure).toBeInstanceOf(RequestError)
    expect(failure.requestId).toBeUndefined()
  })
})
