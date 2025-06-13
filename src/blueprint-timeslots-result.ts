import { ReservationCollectionTimeSlot } from './time-slots/reservation-collection-time-slot'

/**
 * Result object of a blueprint timeslot request.
 */
export default class BlueprintTimeslotsResult {
  private readonly blueprintTimeslots: ReservationCollectionTimeSlot[]

  constructor (blueprintTimeslots: ReservationCollectionTimeSlot[]) {
    this.blueprintTimeslots = blueprintTimeslots
  }

  public getBlueprintTimeslots (): ReservationCollectionTimeSlot[] {
    return this.blueprintTimeslots
  }
}
