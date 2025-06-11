import ReservationCollection from '../reservation-collection'

export default class BlueprintTimeSlot {
  reservationCollections: ReservationCollection[]
  firstCollection: ReservationCollection

  constructor (reservationCollections: ReservationCollection[], firstCollection: ReservationCollection) {
    this.reservationCollections = reservationCollections
    this.firstCollection = firstCollection
  }
}
