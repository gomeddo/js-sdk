import ReservationCollection from '../reservation-collection'

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

  public getFirstCollection (): ReservationCollection {
    return this.firstCollection
  }

  public getReservationCollections (): ReservationCollection[] {
    return this.reservationCollections
  }
}

export {
  ReservationCollectionTimeSlot
}
