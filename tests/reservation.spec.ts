import Contact from '../src/contact'
import Lead from '../src/lead'
import Reservation from '../src/reservation'
import Resource from '../src/resource'
import { getBlankReservationRestData } from './__utils__/reservation-rest-data'
import { ResourceGenerator } from './__utils__/resource-responses'

test('You can set custom properties', () => {
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Resource__c', 'test')
  expect(reservation.getCustomProperty('B25__Resource__c')).toBe('test')
})

test('Custom properties are included in the rest body', () => {
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Resource__c', 'test')
  const restData = reservation.getRestData()
  const expectedRestData = getBlankReservationRestData()
  expectedRestData.reservation.B25__Resource__c = 'test'
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set resource sets the resource id', () => {
  const reservation = new Reservation()
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resource = new Resource(resourceGenerator.getResource())
  reservation.setResource(resource)
  const restData = reservation.getRestData()
  const expectedRestData = getBlankReservationRestData()
  expectedRestData.reservation.B25__Resource__c = 'Id 1'
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set start datetime sets the start datetime of the reservation', () => {
  const date = new Date(Date.UTC(2020, 0, 1, 12, 0, 0))
  const reservation = new Reservation().setStartDatetime(date)
  const restData = reservation.getRestData()
  const expectedRestData = getBlankReservationRestData()
  expectedRestData.reservation.B25__Start__c = '2020-01-01T12:00:00.000Z'
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set end datetime sets the end datetime of the reservation', () => {
  const date = new Date(Date.UTC(2020, 0, 1, 12, 0, 0))
  const reservation = new Reservation().setEndDatetime(date)
  const restData = reservation.getRestData()
  const expectedRestData = getBlankReservationRestData()
  expectedRestData.reservation.B25__End__c = '2020-01-01T12:00:00.000Z'
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set contact adds a contact to the reservation', () => {
  const reservation = new Reservation().setContact(new Contact('firstname', 'lastname', 'email'))
  const restData = reservation.getRestData()
  const expectedRestData = getBlankReservationRestData()
  expectedRestData.contactConfig = {
    contact: {
      FirstName: 'firstname',
      LastName: 'lastname',
      Email: 'email'
    }
  }
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set lead adds a lead to the reservation', () => {
  const reservation = new Reservation().setLead(new Lead('firstname', 'lastname', 'email'))
  const restData = reservation.getRestData()
  const expectedRestData = getBlankReservationRestData()
  expectedRestData.leadConfig = {
    lead: {
      FirstName: 'firstname',
      LastName: 'lastname',
      Email: 'email'
    }
  }
  expect(restData).toStrictEqual(expectedRestData)
})
