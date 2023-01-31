import { Environment } from '../../src/index'
import GoMeddoAPI from '../../src/api/gomeddo-api-requests'
import AvailabilityTimeSlotRequest from '../../src/api/request-bodies/availability-request'
import ReservationPriceCalculationRequest from '../../src/api/request-bodies/reservation-price-calculation-request'
import { ReservationSaveRequest } from '../../src/api/request-bodies/reservation-save-request'
import { getAvailabilityResponse, getAvailabilitySlot } from '../__utils__/availability-responses'

beforeEach(() => {
  fetchMock.resetMocks()
})

test('url and body are constructed correctly for saveReservation', async () => {
  const api = new GoMeddoAPI('key', Environment.PRODUCTION)
  const mock = fetchMock.once('{}')
  const saveRequest = new ReservationSaveRequest({}, null, null, [])
  const result = await api.saveReservation(saveRequest)
  expect(result).toStrictEqual({})
  expect(mock).toHaveBeenCalled()
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25LP/v1/reservations',
    {
      method: 'POST',
      body: JSON.stringify(saveRequest),
      headers: { Authorization: 'Bearer key' }
    }
  )
})

test('the get availabilities makes the correct request', async () => {
  const api = new GoMeddoAPI('key', Environment.PRODUCTION)
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
      headers: { Authorization: 'Bearer key' }
    }
  )
})

test('price calculation makes the correct request', async () => {
  const mock = fetchMock.once(JSON.stringify({
    reservation: {},
    serviceReservations: [],
    serviceCosts: 0
  }))
  const api = new GoMeddoAPI('key', Environment.PRODUCTION)
  const body = new ReservationPriceCalculationRequest({}, [], 0)
  await api.calculatePrice(body)
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/priceCalculation',
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { Authorization: 'Bearer key' }
    }
  )
})
