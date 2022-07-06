import AvailabilityTimeSlotResponse from '../src/api/availability-reponse'
import { AvailabilitySlotType } from '../src/time-slots/availability-time-slot'
import { getAvailabilityResponse, getAvailabilitySlot } from './__utils__/availability-responses'

test('It parses the slots into timelines', async () => {
  const result = new AvailabilityTimeSlotResponse(
    getAvailabilityResponse(['Id 1'], [
      getAvailabilitySlot(1, 0, 1, 8, 'Closed'),
      getAvailabilitySlot(1, 8, 1, 16, 'Open'),
      getAvailabilitySlot(1, 16, 2, 0, 'Closed'),
      getAvailabilitySlot(1, 6, 1, 12, 'Reservation')
    ])[0]
  )
  expect(result.timeSlots.length).toBe(4)
  expect(result.timeSlots[0].type).toBe(AvailabilitySlotType.CLOSED)
  expect(result.timeSlots[0].startOfSlot).toBe('2022-01-01T00:00:00.000Z')
  expect(result.timeSlots[0].endOfSlot).toBe('2022-01-01T08:00:00.000Z')
  expect(result.timeSlots[1].type).toBe(AvailabilitySlotType.RESERVATION)
  expect(result.timeSlots[1].startOfSlot).toBe('2022-01-01T08:00:00.000Z')
  expect(result.timeSlots[1].endOfSlot).toBe('2022-01-01T12:00:00.000Z')
  expect(result.timeSlots[2].type).toBe(AvailabilitySlotType.OPEN)
  expect(result.timeSlots[2].startOfSlot).toBe('2022-01-01T12:00:00.000Z')
  expect(result.timeSlots[2].endOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(result.timeSlots[3].type).toBe(AvailabilitySlotType.CLOSED)
  expect(result.timeSlots[3].startOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(result.timeSlots[3].endOfSlot).toBe('2022-01-02T00:00:00.000Z')
})
