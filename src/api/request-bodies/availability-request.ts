import { SFReservation } from '../../s-objects/reservation'

// Property names have to be exact to the endpoint
export default class AvailabilityTimeSlotRequest {
  rangeStart: Date
  rangeEnd: Date
  dimensionName: string = 'B25__Resource__c'
  scope: string[]
  reservation: Partial<SFReservation> = {}
  includeNonConflictingReservations: boolean = false

  constructor (rangeStart: Date, rangeEnd: Date, scope: string[]) {
    this.rangeStart = rangeStart
    this.rangeEnd = rangeEnd
    this.scope = scope
  }
}
