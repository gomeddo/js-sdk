import { SFReservation } from '../../s-objects/reservation'
import { StandardSFSObject, CustomSFSObject } from '../../s-objects/s-object'
import { SFServiceReservation } from '../../s-objects/service-reservation'

// Property names have to be exact to the endpoint
class ReservationProcessRequest {
  reservation: Partial<SFReservation>
  lead: Partial<StandardSFSObject> | null
  contact: Partial<StandardSFSObject> | null
  serviceReservations: Array<Partial<SFServiceReservation>>
  relatedRecords: Record<string, Array<Partial<CustomSFSObject>>>
  relatedRecordsToDelete: Record<string, Array<Partial<CustomSFSObject>>>

  constructor (reservation: Partial<SFReservation>, lead: Partial<StandardSFSObject> | null, contact: Partial<StandardSFSObject> | null, serviceReservations: Array<Partial<SFServiceReservation>>, relatedRecords?: Record<string, Array<Partial<CustomSFSObject>>>, relatedRecordsToDelete?: Record<string, Array<Partial<CustomSFSObject>>>) {
    this.reservation = reservation
    this.lead = lead
    this.contact = contact
    this.serviceReservations = serviceReservations
    this.relatedRecords = relatedRecords ?? {}
    this.relatedRecordsToDelete = relatedRecordsToDelete ?? {}
  }
}

export {
  ReservationProcessRequest
}
