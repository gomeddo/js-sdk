import Reservation from '../src/reservation'
import Resource from '../src/resource'
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
  expect(restData).toStrictEqual({
    reservation: {
      B25__Resource__c: 'test'
    }
  })
})

test('Set resource sets the resource id', () => {
  const reservation = new Reservation()
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resource = new Resource(resourceGenerator.getResource())
  reservation.setResource(resource)
  const restData = reservation.getRestData()
  expect(restData).toStrictEqual({
    reservation: {
      B25__Resource__c: 'Id 1'
    }
  })
})
