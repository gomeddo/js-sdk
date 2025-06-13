import Reservation from './s-objects/reservation'

/**
 * A ReservationCollection
 */
export default class ReservationCollection {
  public parentReservation: Reservation
  public childReservations: Reservation[]

  constructor (parentReservation: Reservation, childReservations: Reservation[]) {
    this.parentReservation = parentReservation
    this.childReservations = childReservations
  }
}
