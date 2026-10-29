import ReservationCollection from '../reservation-collection'
import Reservation from '../s-objects/reservation'

class ReservationCollectionTimeSlot {
  reservationCollections: ReservationCollection[]
  firstCollection: ReservationCollection
  startDatetime: Date
  endDatetime: Date
  weight?: number

  constructor (startDatetime: Date, endDatetime: Date, reservationCollections: ReservationCollection[], firstCollection: ReservationCollection, weight?: number) {
    this.startDatetime = startDatetime
    this.endDatetime = endDatetime
    this.reservationCollections = reservationCollections
    this.firstCollection = firstCollection
    this.weight = weight
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

  /**
   * The ranking weight of the slot's best reservation collection. Undefined when GoMeddo is too old to send it.
   */
  public getWeight (): number | undefined {
    return this.weight
  }
}

export {
  ReservationCollectionTimeSlot
}
