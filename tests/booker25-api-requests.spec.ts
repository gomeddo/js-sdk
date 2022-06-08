import { Enviroment } from '../src'
import Booker25API from '../src/booker25-api-requests'

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
  const result = await api.getAllChildResources('parentId', undefined, new Set(['Id', 'Name']))
  expect(result).toStrictEqual([])
  expect(mock).toHaveBeenCalled()
  expect(mock).toHaveBeenCalledWith('https://api.booker25.com/api/v3/proxy/resources/parentId/children?fields=Id%2CName&recursive=true')
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
