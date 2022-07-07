import Service from '../../src/s-objects/service'
import { ServiceTimeSlot } from '../../src/time-slots/service-time-slot'

test('It is unavailable with no time slots', () => {
  const service = new Service({}, [])
  expect(service.isAvailable()).toBe(false)
})

test('It is available with one available slot', () => {
  const service = new Service({}, [new ServiceTimeSlot(0, new Date(), new Date()), new ServiceTimeSlot(1, new Date(), new Date())])
  expect(service.isAvailable()).toBe(true)
})
