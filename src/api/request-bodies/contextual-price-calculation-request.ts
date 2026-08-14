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
    // isParent follows the same convention as the trigger path in B25: it is true only when the
    // reservation being processed has child reservations of its own, not merely because it sits at
    // the top of its collection. The frontend builder flow has no child reservations, hence false.
    this.isParent = isParent
    this.beingProcessed = beingProcessed
    // The collection is context only, the endpoint can only change the reservation being processed.
    // That reservation is the top level reservation of its collection and has no children yet.
    // Note: over REST this serializes the reservation twice and Salesforce deserializes the two
    // copies into separate objects, unlike the trigger path where they share one instance.
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
