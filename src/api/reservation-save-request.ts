import { SFReservation } from '../s-objects/reservation'
import { StandardSFSObject } from '../s-objects/s-object'
import { SFServiceReservation } from '../s-objects/service-reservation'

// Property names have to be exact to the endpoint
class ReservationSaveRequest {
  reservation: Partial<SFReservation>
  lead: Partial<StandardSFSObject> | null
  contact: Partial<StandardSFSObject> | null
  serviceReservations: Array<Partial<SFServiceReservation>>

  constructor (reservation: Partial<SFReservation>, lead: Partial<StandardSFSObject> | null, contact: Partial<StandardSFSObject> | null, serviceReservations: Array<Partial<SFServiceReservation>>) {
    this.reservation = reservation
    this.lead = lead
    this.contact = contact
    this.serviceReservations = serviceReservations
  }
}

export {
  ReservationSaveRequest
}
