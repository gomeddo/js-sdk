import { Enviroment } from '../../src'
import AvailabilityTimeSlotRequest from '../../src/api/availability-request'
import Booker25API from '../../src/api/booker25-api-requests'
import { getAvailabilityResponse, getAvailabilitySlot } from '../__utils__/availability-responses'
import { dummyId0 } from '../__utils__/salesforce-dummy-ids'

beforeEach(() => {
  fetchMock.resetMocks()
})

test('url is constructed correctly for getAllResources', async () => {
  const api = new Booker25API(Enviroment.PRODUCTION)
  const mock = fetchMock.once('[]')
  const result = await api.getAllResources(undefined, new Set(['Id', 'Name']))
  expect(result).toStrictEqual([])
  expect(mock).toHaveBeenCalled()
  expect(mock).toHaveBeenCalledWith('https://api.booker25.com/api/v3/proxy/resources?fields=Id%2CName')
})

test('url is constructed correctly for getAllChildren', async () => {
  const api = new Booker25API(Enviroment.PRODUCTION)
  const mock = fetchMock.once('[]')
  const result = await api.getAllChildResources(dummyId0, undefined, new Set(['Id', 'Name']))
  expect(result).toStrictEqual([])
  expect(mock).toHaveBeenCalled()
  expect(mock).toHaveBeenCalledWith(`https://api.booker25.com/api/v3/proxy/resources/${dummyId0}/children?fields=Id%2CName&recursive=true`)
})

test('url and body are constructed correctly for saveReservation', async () => {
  const api = new Booker25API(Enviroment.PRODUCTION)
  const mock = fetchMock.once('{}')
  const result = await api.saveReservation('{}')
  expect(result).toStrictEqual({})
  expect(mock).toHaveBeenCalled()
  expect(mock).toHaveBeenCalledWith(
    'https://api.booker25.com/api/v3/proxy/reservations',
    {
      method: 'POST',
      body: '{}'
    }
  )
})

test('the get availabilities makes the correct request', async () => {
  const api = new Booker25API(Enviroment.PRODUCTION)
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
    'https://api.booker25.com/api/v3/proxy/B25/v1/availability',
    {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }
  )
})

test('price calculation makes the correct request', async () => {
  const mock = fetchMock.once(JSON.stringify({
    reservation: {},
    serviceReservations: [],
    serviceCosts: 0
  }))
  const api = new Booker25API(Enviroment.PRODUCTION)
  const body = JSON.stringify({
    reservation: {},
    serviceReservations: [],
    serviceCosts: 0
  })
  await api.calculatePrice(body)
  expect(mock).toHaveBeenCalledWith(
    'https://api.booker25.com/api/v3/proxy/priceCalculation',
    {
      method: 'POST',
      body: body
    }
  )
})
