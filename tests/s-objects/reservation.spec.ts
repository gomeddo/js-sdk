import ReservationPriceCalculationRequest from '../../src/api/request-bodies/reservation-price-calculation-request'
import { ReservationProcessRequest } from '../../src/api/request-bodies/reservation-save-request'
import { Contact, Lead, Reservation, Resource, Service, SObject } from '../../src/index'
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
  const restData = reservation.getReservationProcessRequest()
  const expectedRestData = new ReservationProcessRequest({ B25__Resource__c: 'test' }, null, null, [], {}, {})
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set resource sets the resource id', () => {
  const reservation = new Reservation()
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resource = new Resource(resourceGenerator.getResource())
  reservation.setResource(resource)
  const restData = reservation.getReservationProcessRequest()
  const expectedRestData = new ReservationProcessRequest({ B25__Resource__c: 'Id 1' }, null, null, [], {}, {})
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set start datetime sets the start datetime of the reservation', () => {
  const date = new Date(Date.UTC(2020, 0, 1, 12, 0, 0))
  const reservation = new Reservation().setStartDatetime(date)
  const restData = reservation.getReservationProcessRequest()
  const expectedRestData = new ReservationProcessRequest({ B25__Start__c: '2020-01-01T12:00:00.000Z' }, null, null, [], {}, {})
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set end datetime sets the end datetime of the reservation', () => {
  const date = new Date(Date.UTC(2020, 0, 1, 12, 0, 0))
  const reservation = new Reservation().setEndDatetime(date)
  const restData = reservation.getReservationProcessRequest()
  const expectedRestData = new ReservationProcessRequest({ B25__End__c: '2020-01-01T12:00:00.000Z' }, null, null, [], {}, {})
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set contact adds a contact to the reservation', () => {
  const reservation = new Reservation().setContact(new Contact('firstname', 'lastname', 'email'))
  const restData = reservation.getReservationProcessRequest()
  const contact = {
    FirstName: 'firstname',
    LastName: 'lastname',
    Email: 'email'
  }
  const expectedRestData = new ReservationProcessRequest({}, null, contact, [], {}, {})
  expect(restData).toStrictEqual(expectedRestData)
})

test('Set lead adds a lead to the reservation', () => {
  const reservation = new Reservation().setLead(new Lead('firstname', 'lastname', 'email'))
  const restData = reservation.getReservationProcessRequest()
  const lead = {
    FirstName: 'firstname',
    LastName: 'lastname',
    Email: 'email'
  }
  const expectedRestData = new ReservationProcessRequest({}, lead, null, [], {}, {})
  expect(restData).toStrictEqual(expectedRestData)
})

test('Add service reservations to the reservation', () => {
  const service = new Service({ ...getSObject('Service Id 1'), B25__Price__c: 10 }, [])
  const service2 = new Service({ ...getSObject('Service Id 2'), B25__Price__c: 18 }, [])
  const reservation = new Reservation()
  reservation.addService(service, 2)
  reservation.addService(service2, 12)
  const restData = reservation.getReservationProcessRequest()
  const serviceReservations = [{
    B25__Service__c: 'Service Id 1',
    B25__Quantity__c: 2,
    B25__Unit_Price__c: 10
  }, {
    B25__Service__c: 'Service Id 2',
    B25__Quantity__c: 12,
    B25__Unit_Price__c: 18
  }]
  const expectedRelatedRecords = {
    B25__Service_Reservation__c: [
      { B25__Quantity__c: 2, B25__Service__c: 'Service Id 1', B25__Unit_Price__c: 10, attributes: { type: 'B25__Service_Reservation__c' } },
      { B25__Quantity__c: 12, B25__Service__c: 'Service Id 2', B25__Unit_Price__c: 18, attributes: { type: 'B25__Service_Reservation__c' } }
    ]
  }
  const expectedRestData = new ReservationProcessRequest({}, null, null, serviceReservations, expectedRelatedRecords, {})
  expect(restData).toStrictEqual(expectedRestData)
})

test('Price calculation includes related records', () => {
  const reservation = new Reservation()
  const relatedRecord = new SObject()
  relatedRecord.setCustomProperty('Quantity__c', 5)
  reservation.addRelatedRecord('B25__Resource_Reservation__c', relatedRecord)
  const priceData = reservation.getPriceCalculationData()
  const expectedPriceData = new ReservationPriceCalculationRequest(
    {},
    [],
    0,
    {
      B25__Resource_Reservation__c: [{ Quantity__c: 5, attributes: { type: 'B25__Resource_Reservation__c' } }]
    }
  )
  expect(priceData).toStrictEqual(expectedPriceData)
})

test('Contextual price calculation wraps the reservation as the parent of the collection', () => {
  const service = new Service({ ...getSObject('Service Id 1'), B25__Price__c: 10 }, [])
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Base_Price__c', 15)
  reservation.addService(service, 2)
  const relatedRecord = new SObject()
  relatedRecord.setCustomProperty('Custom_Field__c', 'value')
  reservation.addRelatedRecord('Custom_Junction__c', relatedRecord)

  const contextualData = reservation.getContextualPriceCalculationData()

  expect(contextualData.isParent).toBe(false)
  expect(contextualData.collection.childReservations).toStrictEqual([])
  // The reservation being processed is also the parent of the collection.
  expect(contextualData.collection.parentReservation).toBe(contextualData.beingProcessed)
  expect(contextualData.beingProcessed.reservation).toStrictEqual({ B25__Base_Price__c: 15 })
  // Mirrors B25's convertToV1RequestData: the configured related records (which include the
  // service reservation registered under its object name) plus the service reservations under
  // the relationship name the contextual calculator actually reads.
  expect(contextualData.beingProcessed.childRecords).toStrictEqual({
    Custom_Junction__c: [
      { Custom_Field__c: 'value', attributes: { type: 'Custom_Junction__c' } }
    ],
    B25__Service_Reservation__c: [
      { B25__Quantity__c: 2, B25__Service__c: 'Service Id 1', B25__Unit_Price__c: 10, attributes: { type: 'B25__Service_Reservation__c' } }
    ],
    B25__ServiceReservations__r: [
      { B25__Quantity__c: 2, B25__Service__c: 'Service Id 1', B25__Unit_Price__c: 10, attributes: { type: 'B25__Service_Reservation__c' } }
    ]
  })
})

test('Price calculation includes empty related records by default', () => {
  const reservation = new Reservation()
  const priceData = reservation.getPriceCalculationData()
  const expectedPriceData = new ReservationPriceCalculationRequest({}, [], 0, {})
  expect(priceData).toStrictEqual(expectedPriceData)
})

test('Price calculation includes service reservations and related records together', () => {
  const service = new Service({ ...getSObject('Service Id 1'), B25__Price__c: 10 }, [])
  const reservation = new Reservation()
  reservation.addService(service, 2)
  const relatedRecord = new SObject()
  relatedRecord.setCustomProperty('Custom_Field__c', 'value')
  reservation.addRelatedRecord('Custom_Junction__c', relatedRecord)
  const priceData = reservation.getPriceCalculationData()
  expect(priceData.serviceCosts).toBe(20)
  expect(priceData.serviceReservations).toStrictEqual([{
    B25__Service__c: 'Service Id 1',
    B25__Quantity__c: 2,
    B25__Unit_Price__c: 10
  }])
  expect(priceData.relatedRecords).toStrictEqual({
    B25__Service_Reservation__c: [
      { B25__Quantity__c: 2, B25__Service__c: 'Service Id 1', B25__Unit_Price__c: 10, attributes: { type: 'B25__Service_Reservation__c' } }
    ],
    Custom_Junction__c: [
      { Custom_Field__c: 'value', attributes: { type: 'Custom_Junction__c' } }
    ]
  })
})
