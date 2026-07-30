import { SFReservation } from '../../s-objects/reservation'
import { CustomSFSObject } from '../../s-objects/s-object'

// Property names have to be exact to the endpoint.
// Mirrors B25's CustomPriceCalculation.PriceCalculationParameters / Reservation / ReservationCollection.
// The endpoint deserializes strictly, so no additional keys may be present.

interface ContextualReservation {
  reservation: Partial<SFReservation>
  childRecords: Record<string, Array<Partial<CustomSFSObject>>>
}

interface ContextualReservationCollection {
  parentReservation: ContextualReservation
  childReservations: ContextualReservation[]
}

export default class ContextualPriceCalculationRequest {
  isParent: boolean
  beingProcessed: ContextualReservation
  collection: ContextualReservationCollection

  constructor (beingProcessed: ContextualReservation, isParent: boolean = false) {
    this.isParent = isParent
    this.beingProcessed = beingProcessed
    // For the frontend builder flow the reservation being processed is always the parent
    // and there are no sibling/child reservations in the collection yet.
    this.collection = {
      parentReservation: beingProcessed,
      childReservations: []
    }
  }
}

export {
  ContextualReservation,
  ContextualReservationCollection
}
