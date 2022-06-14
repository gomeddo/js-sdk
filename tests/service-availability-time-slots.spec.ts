import ServiceTimeSlotResponse from '../src/api/service-availability-response'
import { getServiceResponse, getServiceSlot } from './__utils__/availability-responses'

test('It parses the slots into timelines', async () => {
  const result = new ServiceTimeSlotResponse(
    getServiceResponse(['1'], ['1'], [
      getServiceSlot(1, 0, 2, 0, 'Availability', 10),
      getServiceSlot(1, 8, 1, 12, 'Reservation', 5),
      getServiceSlot(1, 10, 1, 14, 'Reservation', 5),
      getServiceSlot(1, 13, 1, 16, 'Reservation', 5)
    ])[0]
  )
  expect(result.services.length).toBe(1)
  expect(result.services[0].timeSlots.length).toBe(7)
  expect(result.services[0].timeSlots[0].remainingQuantity).toBe(10)
  expect(result.services[0].timeSlots[0].startOfSlot).toBe('2022-01-01T00:00:00.000Z')
  expect(result.services[0].timeSlots[0].endOfSlot).toBe('2022-01-01T08:00:00.000Z')

  expect(result.services[0].timeSlots[1].remainingQuantity).toBe(5)
  expect(result.services[0].timeSlots[1].startOfSlot).toBe('2022-01-01T08:00:00.000Z')
  expect(result.services[0].timeSlots[1].endOfSlot).toBe('2022-01-01T10:00:00.000Z')

  expect(result.services[0].timeSlots[2].remainingQuantity).toBe(0)
  expect(result.services[0].timeSlots[2].startOfSlot).toBe('2022-01-01T10:00:00.000Z')
  expect(result.services[0].timeSlots[2].endOfSlot).toBe('2022-01-01T12:00:00.000Z')

  expect(result.services[0].timeSlots[3].remainingQuantity).toBe(5)
  expect(result.services[0].timeSlots[3].startOfSlot).toBe('2022-01-01T12:00:00.000Z')
  expect(result.services[0].timeSlots[3].endOfSlot).toBe('2022-01-01T13:00:00.000Z')

  expect(result.services[0].timeSlots[4].remainingQuantity).toBe(0)
  expect(result.services[0].timeSlots[4].startOfSlot).toBe('2022-01-01T13:00:00.000Z')
  expect(result.services[0].timeSlots[4].endOfSlot).toBe('2022-01-01T14:00:00.000Z')

  expect(result.services[0].timeSlots[5].remainingQuantity).toBe(5)
  expect(result.services[0].timeSlots[5].startOfSlot).toBe('2022-01-01T14:00:00.000Z')
  expect(result.services[0].timeSlots[5].endOfSlot).toBe('2022-01-01T16:00:00.000Z')

  expect(result.services[0].timeSlots[6].remainingQuantity).toBe(10)
  expect(result.services[0].timeSlots[6].startOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(result.services[0].timeSlots[6].endOfSlot).toBe('2022-01-02T00:00:00.000Z')
})
