import Booker25, { Enviroment } from '../src/index'
import Reservation from '../src/s-objects/reservation'
import Service from '../src/s-objects/service'
import { getBlankReservationRestData } from './__utils__/reservation-rest-data'

beforeEach(() => {
  fetchMock.resetMocks()
})

test('Booker25 has a version number', () => {
  expect(Booker25.version).toBe('0.0.1')
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
  const expectedBodyData = getBlankReservationRestData()
  expectedBodyData.reservation.B25__Api_Visible__c = true
  expect(mock).toHaveBeenCalledWith(
    'https://api.booker25.com/api/v3/proxy/reservations',
    {
      method: 'POST',
      body: JSON.stringify(expectedBodyData)
    }
  )
})

test('You can recalculate the price of the reservation through it', async () => {
  fetchMock.once(JSON.stringify({
    reservation: {
      B25__Subtotal__c: 150
    },
    serviceReservations: [{
      B25__Quantity__c: 12,
      B25__Unit_Price__c: 23
    }],
    serviceCosts: 276
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Quantity__c', 10)
  reservation.setCustomProperty('B25__Base_Price__c', 15)
  const service = new Service({
    B25__Price__c: 23
  }, [])
  reservation.addService(service, 12)
  const result = await (new Booker25(Enviroment.PRODUCTION)).calculatePrice(reservation)
  expect(result.getCustomProperty('B25__Subtotal__c')).toStrictEqual(150)
  expect(result.getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(150)
  expect(result.getCustomProperty('B25__Service_Costs__c')).toStrictEqual(276)
  expect(result.getCustomProperty('B25LP__Service_Costs_Incl__c')).toStrictEqual(276)
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(150 + 276)
  expect(result.getCustomProperty('B25LP__Total_Incl__c')).toStrictEqual(150 + 276)
  expect(result.serviceReservations[0].getCustomProperty('B25__Subtotal__c')).toStrictEqual(276)
  expect(result.serviceReservations[0].getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(276)
})

test('You can recalculate the price of the reservation through it with VAT rates specified', async () => {
  fetchMock.once(JSON.stringify({
    reservation: {
      B25__Subtotal__c: 150,
      B25LP__VAT_Rate__c: 0.2
    },
    serviceReservations: [{
      B25__Quantity__c: 12,
      B25__Unit_Price__c: 23,
      B25LP__VAT_Rate__c: 0.1
    }],
    serviceCosts: 276
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Quantity__c', 10)
  reservation.setCustomProperty('B25__Base_Price__c', 15)
  const service = new Service({
    B25__Price__c: 23
  }, [])
  reservation.addService(service, 12)
  const result = await (new Booker25(Enviroment.PRODUCTION)).calculatePrice(reservation)
  expect(result.getCustomProperty('B25__Subtotal__c')).toStrictEqual(150)
  expect(result.getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(150 + (150 * 0.2))
  expect(result.getCustomProperty('B25__Service_Costs__c')).toStrictEqual(276)
  expect(result.getCustomProperty('B25LP__Service_Costs_Incl__c')).toStrictEqual(276 + (276 * 0.1))
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(150 + 276)
  expect(result.getCustomProperty('B25LP__Total_Incl__c')).toStrictEqual(150 + (150 * 0.2) + 276 + (276 * 0.1))
  expect(result.serviceReservations[0].getCustomProperty('B25__Subtotal__c')).toStrictEqual(276)
  expect(result.serviceReservations[0].getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(276 + (276 * 0.1))
})
