import ReservationCollection from '../reservation-collection'
import Reservation from '../s-objects/reservation'

class ReservationCollectionTimeSlot {
  reservationCollections: ReservationCollection[]
  firstCollection: ReservationCollection
  startDatetime: Date
  endDatetime: Date

  constructor (startDatetime: Date, endDatetime: Date, reservationCollections: ReservationCollection[], firstCollection: ReservationCollection) {
    this.startDatetime = startDatetime
    this.endDatetime = endDatetime
    this.reservationCollections = reservationCollections
    this.firstCollection = firstCollection
  }

  public getStartDateTime (): Date {
    return this.startDatetime
  }

  public getEndDateTime (): Date {
    return this.endDatetime
  }

  public getFirstCollection (): ReservationCollection | undefined {
    return this.firstCollection
  }

  public getParentReservation (): Reservation | undefined {
    return this.firstCollection?.parentReservation
  }

  public getReservationCollections (): ReservationCollection[] | undefined {
    return this.reservationCollections
  }
}

export {
  ReservationCollectionTimeSlot
}
