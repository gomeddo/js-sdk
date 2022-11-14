import { Service, ServiceTimeSlot } from '../../src/index'
import { getSObject } from '../__utils__/s-object-data'

test('It is unavailable with no time slots', () => {
  const service = new Service(getSObject(), [])
  expect(service.isAvailable()).toBe(false)
})

test('It is available with one available slot', () => {
  const service = new Service(getSObject(), [new ServiceTimeSlot(0, new Date(), new Date()), new ServiceTimeSlot(1, new Date(), new Date())])
  expect(service.isAvailable()).toBe(true)
})
