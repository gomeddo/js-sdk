import { SFReservation } from '../../s-objects/reservation'
import { StandardSFSObject, CustomSFSObject } from '../../s-objects/s-object'
import { ReservationProcessRequest } from './reservation-save-request'

class FrontendBuilderReservationProcessRequest extends ReservationProcessRequest {
  frontendBuilderDeveloperName: string | null
  constructor (
    reservation: Partial<SFReservation>,
    contact: Partial<StandardSFSObject> | null,
    frontendBuilderDeveloperName: string | null,
    relatedRecords?: Record<string, Array<Partial<CustomSFSObject>>>
  ) {
    super(
      reservation,
      null, // lead removed
      contact,
      [], // no service reservations
      relatedRecords ?? {},
      {} // no records to delete
    )
    this.frontendBuilderDeveloperName = frontendBuilderDeveloperName
  }
}

export { FrontendBuilderReservationProcessRequest }
