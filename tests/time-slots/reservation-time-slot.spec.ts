import { ReservationTimeSlot } from '../../src/time-slots/reservation-time-slot'
import Reservation from '../../src/s-objects/reservation'
import TimeSlotRequestBody from '../../src/api/request-bodies/timeslots-request-body'
import { dummyId0 } from '../__utils__/salesforce-dummy-ids'

describe('ReservationTimeSlot', () => {
  let reservationTimeSlotEmpty: ReservationTimeSlot
  let reservationTimeSlot: ReservationTimeSlot
  const requestBody: TimeSlotRequestBody = {
    reservation: {
      B25__Resource__c: dummyId0
    },
    junctions: {
      key: [
        {
          attributes: {
            type: 'value'
          }
        }
      ]
    },
    timeSlotContext: {
      startOfRange: '2024-04-12T09:00:00Z',
      endOfRange: '2024-04-12T10:00:00Z'
    }
  }

  beforeEach(() => {
    const startOfSlot = new Date('2024-04-12T09:00:00Z')
    const endOfSlot = new Date('2024-04-12T10:00:00Z')
    const reservationsEmpty: Reservation[] = []
    const reservations: Reservation[] = [
      new Reservation().setStartDatetime(new Date(startOfSlot)).setEndDatetime(new Date(endOfSlot))
    ]

    reservationTimeSlotEmpty = new ReservationTimeSlot(startOfSlot, endOfSlot, reservationsEmpty, requestBody)
    reservationTimeSlot = new ReservationTimeSlot(startOfSlot, endOfSlot, reservations, requestBody)
  })

  it('should have the correct start and end time', () => {
    expect(reservationTimeSlot.startOfSlot).toEqual(new Date('2024-04-12T09:00:00Z'))
    expect(reservationTimeSlot.endOfSlot).toEqual(new Date('2024-04-12T10:00:00Z'))
  })

  it('should have zero reservation', () => {
    expect(reservationTimeSlotEmpty.reservations).toHaveLength(0)
  })

  it('should have one reservation', () => {
    expect(reservationTimeSlot.reservations).toHaveLength(1)
  })

  it('should return one Reservation object', () => {
    expect(reservationTimeSlot.getReservations()[0]).toBeInstanceOf(Reservation)
  })

  it('should return the correct number of reservations', () => {
    expect(reservationTimeSlot.numberOfReservations()).toBe(1)
  })

  it('should have a reservation with the correct start and end time', () => {
    expect(reservationTimeSlot.getReservations()[0].getStartDatetime()).toEqual(new Date('2024-04-12T09:00:00Z'))
    expect(reservationTimeSlot.getReservations()[0].getEndDatetime()).toEqual(new Date('2024-04-12T10:00:00Z'))
  })

  it('should return the correct number of reservations', () => {
    const startOfSlot = new Date('2024-04-12T09:00:00Z')
    const endOfSlot = new Date('2024-04-12T10:00:00Z')
    const reservations: Reservation[] = [
      new Reservation().setStartDatetime(new Date(startOfSlot)).setEndDatetime(new Date(endOfSlot)),
      new Reservation().setStartDatetime(new Date(startOfSlot)).setEndDatetime(new Date(endOfSlot))
    ]

    reservationTimeSlot = new ReservationTimeSlot(new Date(startOfSlot), new Date(endOfSlot), reservations, requestBody)
    expect(reservationTimeSlot.numberOfReservations()).toBe(2)
  })
})
