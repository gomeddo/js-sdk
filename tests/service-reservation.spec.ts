import Service from '../src/s-objects/service'
import ServiceReservation from '../src/s-objects/service-reservation'

test('Sets the id an quantity based on what was passed in the constructor', () => {
  const service = new Service({ Id: 'Service Id 1' }, [])
  const serviceReservation = new ServiceReservation(service, 2)
  const restData = serviceReservation.getRestData()
  expect(restData.B25__Service__c).toBe('Service Id 1')
  expect(restData.B25__Quantity__c).toBe(2)
})
