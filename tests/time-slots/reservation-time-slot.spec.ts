import { ReservationTimeSlot } from '../../src/time-slots/reservation-time-slot'
import Reservation from '../../src/s-objects/reservation'
import { TimeSlotJunctions } from '../../src/api/request-bodies/timeslots-request-body'

describe('ReservationTimeSlot', () => {
  let reservationTimeSlot: ReservationTimeSlot

  beforeEach(() => {
    const startOfSlot = new Date('2024-04-12T09:00:00Z')
    const endOfSlot = new Date('2024-04-12T10:00:00Z')
    const reservations: Reservation[] = []
    const junctions: TimeSlotJunctions | undefined = undefined

    reservationTimeSlot = new ReservationTimeSlot(startOfSlot, endOfSlot, reservations, junctions)
  })

  it('should have the correct start and end time', () => {
    expect(reservationTimeSlot.startOfSlot).toEqual(new Date('2024-04-12T09:00:00Z'))
    expect(reservationTimeSlot.endOfSlot).toEqual(new Date('2024-04-12T10:00:00Z'))
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

    reservationTimeSlot = new ReservationTimeSlot(new Date(startOfSlot), new Date(endOfSlot), reservations, undefined)
    expect(reservationTimeSlot.numberOfReservations()).toBe(2)
  })

  it('should have undefined junctions', () => {
    expect(reservationTimeSlot.junctions).toBeUndefined()
  })

  it('should return the correct number of junctions', () => {
    expect(reservationTimeSlot.numberOfJunctions()).toBe(0)
  })

  it('should return undefined for getJunctions', () => {
    expect(reservationTimeSlot.getJunctions()).toBeUndefined()
  })

  it('should return a junction with the correct attributes', () => {
    const junctions: TimeSlotJunctions = {
      key: [
        {
          attributes: {
            type: 'value'
          }
        }
      ]
    }

    reservationTimeSlot = new ReservationTimeSlot(new Date(), new Date(), [], junctions)
    expect(reservationTimeSlot.getJunctions()).toEqual(junctions)
  })

  it('should return the correct number of junctions', () => {
    const junctions: TimeSlotJunctions = {
      key: [
        {
          attributes: {
            type: 'value'
          }
        }
      ]
    }

    reservationTimeSlot = new ReservationTimeSlot(new Date(), new Date(), [], junctions)
    expect(reservationTimeSlot.numberOfJunctions()).toBe(1)
  })
})
