import GoMeddo, { Environment, Reservation, Service, SObject } from '../src/index'
import { ReservationProcessRequest } from '../src/api/request-bodies/reservation-save-request'
import { getSObject } from './__utils__/s-object-data'
import { dummyId0, dummyId1, dummyId2 } from './__utils__/salesforce-dummy-ids'
import ReservationCollection from '../src/api/request-bodies/reservation-collection'

beforeEach(() => {
  fetchMock.resetMocks()
})

test('GoMeddo has a version number', () => {
  expect(GoMeddo.version).toMatch(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)
})

test('You can save a reservations through it', async () => {
  const mock = fetchMock.once(JSON.stringify({
    reservation: {
      B25__Resource__c: 'test'
    },
    lead: null,
    contact: null,
    serviceReservations: []
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Api_Visible__c', true)
  const result = await (new GoMeddo('key', Environment.PRODUCTION)).saveReservation(reservation)
  const expectedResult = new Reservation()
  const dummyDate = new Date()
  expectedResult.id = undefined as any
  expectedResult.setStartDatetime(dummyDate)
  expectedResult.setEndDatetime(dummyDate)
  expectedResult.setCustomProperty('B25__Resource__c', 'test')
  result.setStartDatetime(dummyDate)
  result.setEndDatetime(dummyDate)
  expect(result).toStrictEqual(expectedResult)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = new ReservationProcessRequest({ B25__Api_Visible__c: true }, null, null, [])
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25LP/v1/reservations',
    {
      method: 'POST',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer key' }
    }
  )
})

test('You can update a reservation through it', async () => {
  const mock = fetchMock.once('')
  const reservationData = { Id: dummyId0, Name: 'R-00000' }
  const reservation = new Reservation(reservationData)
  await (new GoMeddo('key', Environment.PRODUCTION)).updateReservation(reservation)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [new ReservationCollection(reservationData, new Map(), new Map())]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/reservation-collection',
    {
      method: 'PATCH',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer key' }
    }
  )
})

test('You can update multiple reservations through it', async () => {
  const mock = fetchMock.once('')
  const reservation1Data = { Id: dummyId0, Name: 'R-00000' }
  const reservation2Data = { Id: dummyId1, Name: 'R-00001' }
  const reservation1 = new Reservation(reservation1Data)
  const reservation2 = new Reservation(reservation2Data)
  await (new GoMeddo('key', Environment.PRODUCTION)).updateReservations([reservation1, reservation2])
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [
    new ReservationCollection(reservation1Data, new Map(), new Map()),
    new ReservationCollection(reservation2Data, new Map(), new Map())
  ]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/reservation-collection',
    {
      method: 'PATCH',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer key' }
    }
  )
})

test('You can update a reservation with related records through it', async () => {
  const mock = fetchMock.once('')
  const reservationData = { Id: dummyId0, Name: 'R-00000' }
  const reservation = new Reservation(reservationData)
  const service = new Service({ ...getSObject(), B25__Price__c: 23 }, [])
  reservation.addService(service, 12)
  const reservationContact = new SObject()
  reservationContact.setCustomProperty('B25__Notes__c', 'Test Notes')
  reservation.addReservationContact(reservationContact)
  const resourceReservation = new SObject()
  resourceReservation.setCustomProperty('Quantity__c', 2)
  reservation.addRelatedRecord('B25__Resource_Reservation__c', resourceReservation)
  const reservationContactRemove = new SObject({ Id: dummyId1, Name: '' })
  reservation.removeReservationContact(reservationContactRemove)
  const resourceReservationRemove = new SObject({ Id: dummyId2, Name: '' })
  reservation.removeRelatedRecord('B25__Resource_Reservation__c', resourceReservationRemove)

  await (new GoMeddo('key', Environment.PRODUCTION)).updateReservation(reservation)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [new ReservationCollection(reservationData, new Map(
    [
      ['B25__Service_Reservation__c', [{ attributes: { type: 'B25__Service_Reservation__c' }, B25__Quantity__c: 12, B25__Service__c: dummyId0, B25__Unit_Price__c: 23 }]],
      ['B25__ReservationContact__c', [{ B25__Notes__c: 'Test Notes', attributes: { type: 'B25__ReservationContact__c' } }]],
      ['B25__Resource_Reservation__c', [{ Quantity__c: 2, attributes: { type: 'B25__Resource_Reservation__c' } }]]
    ]), new Map(
    [
      ['B25__ReservationContact__c', [{ Id: dummyId1, Name: '', attributes: { type: 'B25__ReservationContact__c' } }]],
      ['B25__Resource_Reservation__c', [{ Id: dummyId2, Name: '', attributes: { type: 'B25__Resource_Reservation__c' } }]]
    ])
  )]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/reservation-collection',
    {
      method: 'PATCH',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer key' }
    }
  )
})

test('You can delete a reservation through it', async () => {
  const mock = fetchMock.once('')
  const reservationData = { Id: dummyId0, Name: 'R-00000' }
  const reservation = new Reservation(reservationData)
  await (new GoMeddo('key', Environment.PRODUCTION)).deleteReservation(reservation)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [new ReservationCollection(reservationData, new Map(), new Map())]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/reservation-collection',
    {
      method: 'DELETE',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer key' }
    }
  )
})

test('You can delete multiple reservations through it', async () => {
  const mock = fetchMock.once('')
  const reservation1Data = { Id: dummyId0, Name: 'R-00000' }
  const reservation2Data = { Id: dummyId1, Name: 'R-00001' }
  const reservation1 = new Reservation(reservation1Data)
  const reservation2 = new Reservation(reservation2Data)
  await (new GoMeddo('key', Environment.PRODUCTION)).deleteReservations([reservation1, reservation2])
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [
    new ReservationCollection(reservation1Data, new Map(), new Map()),
    new ReservationCollection(reservation2Data, new Map(), new Map())
  ]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/reservation-collection',
    {
      method: 'DELETE',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer key' }
    }
  )
})

test('You can delete a reservation with related records through it', async () => {
  const mock = fetchMock.once('')
  const reservationData = { Id: dummyId0, Name: 'R-00000' }
  const reservation = new Reservation(reservationData)
  const reservationContact = new SObject({ Id: dummyId1, Name: '' })
  reservation.addReservationContact(reservationContact)
  const resourceReservation = new SObject({ Id: dummyId2, Name: '' })
  reservation.addRelatedRecord('B25__Resource_Reservation__c', resourceReservation)

  await (new GoMeddo('key', Environment.PRODUCTION)).updateReservation(reservation)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [new ReservationCollection(reservationData, new Map(
    [
      ['B25__ReservationContact__c', [{ Id: dummyId1, Name: '', attributes: { type: 'B25__ReservationContact__c' } }]],
      ['B25__Resource_Reservation__c', [{ Id: dummyId2, Name: '', attributes: { type: 'B25__Resource_Reservation__c' } }]]
    ]), new Map()
  )]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/reservation-collection',
    {
      method: 'PATCH',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer key' }
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
  const service = new Service({ ...getSObject(), B25__Price__c: 23 }, [])
  reservation.addService(service, 12)
  const result = await (new GoMeddo('key', Environment.PRODUCTION)).calculatePrice(reservation)
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
  const serviceSobject = getSObject()
  serviceSobject.B25__Price__c = 23
  const service = new Service(serviceSobject, [])
  reservation.addService(service, 12)
  const result = await (new GoMeddo('dummyKey', Environment.PRODUCTION)).calculatePrice(reservation)
  expect(result.getCustomProperty('B25__Subtotal__c')).toStrictEqual(150)
  expect(result.getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(150 + (150 * 0.2))
  expect(result.getCustomProperty('B25__Service_Costs__c')).toStrictEqual(276)
  expect(result.getCustomProperty('B25LP__Service_Costs_Incl__c')).toStrictEqual(276 + (276 * 0.1))
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(150 + 276)
  expect(result.getCustomProperty('B25LP__Total_Incl__c')).toStrictEqual(150 + (150 * 0.2) + 276 + (276 * 0.1))
  expect(result.serviceReservations[0].getCustomProperty('B25__Subtotal__c')).toStrictEqual(276)
  expect(result.serviceReservations[0].getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(276 + (276 * 0.1))
})
