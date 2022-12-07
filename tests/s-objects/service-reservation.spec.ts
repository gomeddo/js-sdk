import { Service, ServiceReservation } from '../../src/index'
import { getSObject } from '../__utils__/s-object-data'

test('Sets the id an quantity based on what was passed in the constructor', () => {
  const service = new Service({ ...getSObject('Service Id 1', 'Service name'), B25__Price__c: 10 }, [])
  const serviceReservation = new ServiceReservation(service, 2)
  const restData = serviceReservation.getSFSObject()
  expect(restData.B25__Service__c).toBe('Service Id 1')
  expect(restData.B25__Quantity__c).toBe(2)
  expect(restData.B25__Unit_Price__c).toBe(10)
})
