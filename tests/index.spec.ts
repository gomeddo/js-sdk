import Booker25, { Enviroment } from '../src/index'
import Reservation from '../src/reservation'

test('Booker25 has a version number', () => {
  expect(Booker25.version).toMatch(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)
})

test('You can save a reservations through it', async () => {
  const mock = fetchMock.once(JSON.stringify({
    reservation: {
      B25__Resource__c: 'test'
    }
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Api_Visible__c', true)
  const result = await (new Booker25(Enviroment.PRODUCTION)).saveReservation(reservation)
  const expectedResult = new Reservation()
  expectedResult.setCustomProperty('B25__Resource__c', 'test')
  expect(result).toStrictEqual(expectedResult)
  expect(mock).toHaveBeenCalled()
  expect(mock).toHaveBeenCalledWith(
    'https://api.booker25.com/api/v3/proxy/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        reservation: {
          B25__Api_Visible__c: true
        }
      })
    }
  )
})
