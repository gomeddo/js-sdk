import { SFReservation } from '../../s-objects/reservation'
import { CustomSFSObject } from '../../s-objects/s-object'

// Property names have to be exact to the endpoint and json serializable
export default class ReservationCollection {
  private readonly reservation: SFReservation
  private readonly relatedRecords: Record<string, Array<Partial<CustomSFSObject>>>
  private readonly relatedRecordsToRemove: Record<string, Array<Partial<CustomSFSObject>>>

  constructor (reservation: SFReservation, relatedRecords: Map<string, Array<Partial<CustomSFSObject>>>, relatedRecordsToRemove: Map<string, Array<Partial<CustomSFSObject>>>) {
    this.reservation = reservation
    this.relatedRecords = Object.fromEntries(relatedRecords)
    this.relatedRecordsToRemove = Object.fromEntries(relatedRecordsToRemove)
  }
}
