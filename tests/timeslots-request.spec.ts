import { Environment, TimeSlotsRequest } from '../src'
import GoMeddoAPI from '../src/api/gomeddo-api-requests'
import TimeSlotRequestBody from '../src/api/request-bodies/timeslots-request-body'
import Reservation from '../src/s-objects/reservation'

beforeEach(() => {
  fetchMock.resetMocks()
})

describe('TimeSlotsRequest', () => {
  const timeSlotsApiUrl = 'https://api.gomeddo.com/api/v3/proxy/B25/v1/timeSlots'
  const apiKey = 'test-key'
  const startOfRange = new Date('2024-04-12T00:00:00Z')
  const endOfRange = new Date('2024-04-13T00:00:00Z')

  const getTimeslotsRequest = (): TimeSlotsRequest => new TimeSlotsRequest(new GoMeddoAPI(apiKey, Environment.PRODUCTION), startOfRange, endOfRange)

  test('should throw error for negative duration', () => {
    const request = getTimeslotsRequest()
    expect(() => request.withDuration(-10)).toThrow('TimeSlot duration cannot be negative or zero')
  })

  test('should throw error for negative interval', () => {
    const request = getTimeslotsRequest()
    expect(() => request.withInterval(-10)).toThrow('TimeSlot interval cannot be negative or zero')
  })

  test('should make correct API request', async () => {
    fetchMock.mockResponseOnce('[]')
    const request = getTimeslotsRequest()
    await request.getResults()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(timeSlotsApiUrl, {
      method: 'POST',
      body: JSON.stringify(new TimeSlotRequestBody(startOfRange.toISOString(), endOfRange.toISOString())),
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })
  })

  test('should return empty array if no timeslots are returned', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ timeSlots: [] }))
    const request = getTimeslotsRequest()
    const result = await request.getResults()
    const expectedResponse = {
      startOfRange: startOfRange,
      endOfRange: endOfRange,
      timeSlots: []
    }

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result).toEqual(expectedResponse)
  })

  test('should correctly handle no reservations', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      timeSlots: [
        {
          startDatetime: '2024-04-12T00:00:00Z',
          endDatetime: '2024-04-12T01:00:00Z'
        }
      ]
    }))
    const request = getTimeslotsRequest()
    const result = (await request.getResults()).getTimeSlots()[0]

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.getReservations().length).toEqual(1)
    expect(result.getReservations()[0]).toBeInstanceOf(Reservation)
    expect(result.getReservations()[0].getStartDatetime()).toEqual(new Date('2024-04-12T00:00:00Z'))
    expect(result.getReservations()[0].getEndDatetime()).toEqual(new Date('2024-04-12T01:00:00Z'))
  })
})
