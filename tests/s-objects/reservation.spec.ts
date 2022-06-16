import { ContactConfig, LeadConfig, ReservationSaveRequest } from '../../src/api/reservation-save-request'
import Contact from '../../src/s-objects/contact'
import Lead from '../../src/s-objects/lead'
import Reservation from '../../src/s-objects/reservation'
import Resource from '../../src/s-objects/resource'
import Service from '../../src/s-objects/service'
import { ResourceGenerator } from '../__utils__/resource-responses'
import { getSObject } from '../__utils__/s-object-data'

test('You can set custom properties', () => {
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Resource__c', 'test')
  expect(reservation.getCustomProperty('B25__Resource__c')).toBe('test')
})

test('Custom properties are included in the rest body', () => {
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Resource__c', 'test')
  const restData = reservation.getReservationSaveRequest()
  const expectedRestData = new ReservationSaveRequest({ B25__Resource__c: 'test' }, null, null, [])
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set resource sets the resource id', () => {
  const reservation = new Reservation()
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resource = new Resource(resourceGenerator.getResource())
  reservation.setResource(resource)
  const restData = reservation.getReservationSaveRequest()
  const expectedRestData = new ReservationSaveRequest({ B25__Resource__c: 'Id 1' }, null, null, [])
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set start datetime sets the start datetime of the reservation', () => {
  const date = new Date(Date.UTC(2020, 0, 1, 12, 0, 0))
  const reservation = new Reservation().setStartDatetime(date)
  const restData = reservation.getReservationSaveRequest()
  const expectedRestData = new ReservationSaveRequest({ B25__Start__c: '2020-01-01T12:00:00.000Z' }, null, null, [])
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set end datetime sets the end datetime of the reservation', () => {
  const date = new Date(Date.UTC(2020, 0, 1, 12, 0, 0))
  const reservation = new Reservation().setEndDatetime(date)
  const restData = reservation.getReservationSaveRequest()
  const expectedRestData = new ReservationSaveRequest({ B25__End__c: '2020-01-01T12:00:00.000Z' }, null, null, [])
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set contact adds a contact to the reservation', () => {
  const reservation = new Reservation().setContact(new Contact('firstname', 'lastname', 'email'))
  const restData = reservation.getReservationSaveRequest()
  const contactConfig = new ContactConfig({
    FirstName: 'firstname',
    LastName: 'lastname',
    Email: 'email'
  })
  const expectedRestData = new ReservationSaveRequest({}, null, contactConfig, [])
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set lead adds a lead to the reservation', () => {
  const reservation = new Reservation().setLead(new Lead('firstname', 'lastname', 'email'))
  const restData = reservation.getReservationSaveRequest()
  const leadConfig = new LeadConfig({
    FirstName: 'firstname',
    LastName: 'lastname',
    Email: 'email'
  })
  const expectedRestData = new ReservationSaveRequest({}, leadConfig, null, [])
  expect(restData).toStrictEqual(expectedRestData)
})

test('Add service reservations to the reservation', () => {
  const service = new Service({ ...getSObject('Service Id 1'), B25__Price__c: 10 }, [])
  const service2 = new Service({ ...getSObject('Service Id 2'), B25__Price__c: 18 }, [])
  const reservation = new Reservation()
  reservation.addService(service, 2)
  reservation.addService(service2, 12)
  const restData = reservation.getReservationSaveRequest()
  const serviceReservations = [{
    B25__Service__c: 'Service Id 1',
    B25__Quantity__c: 2,
    B25__Unit_Price__c: 10
  }, {
    B25__Service__c: 'Service Id 2',
    B25__Quantity__c: 12,
    B25__Unit_Price__c: 18
  }]
  const expectedRestData = new ReservationSaveRequest({}, null, null, serviceReservations)
  expect(restData).toStrictEqual(expectedRestData)
})
