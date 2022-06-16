import { SFReservation } from '../s-objects/reservation'
import { StandardSFSObject } from '../s-objects/s-object'
import { SFServiceReservation } from '../s-objects/service-reservation'

// Property names have to be exact to the endpoint
class ReservationSaveRequest {
  reservation: Partial<SFReservation>
  leadConfig: LeadConfig | null
  contactConfig: ContactConfig | null
  serviceReservations: Array<Partial<SFServiceReservation>>

  constructor (reservation: Partial<SFReservation>, leadConfig: LeadConfig | null, contactConfig: ContactConfig | null, serviceReservations: Array<Partial<SFServiceReservation>>) {
    this.reservation = reservation
    this.leadConfig = leadConfig
    this.contactConfig = contactConfig
    this.serviceReservations = serviceReservations
  }
}

class LeadConfig {
  lead: Partial<StandardSFSObject>

  constructor (lead: Partial<StandardSFSObject>) {
    this.lead = lead
  }
}

class ContactConfig {
  contact: Partial<StandardSFSObject>

  constructor (contact: Partial<StandardSFSObject>) {
    this.contact = contact
  }
}

export {
  ReservationSaveRequest,
  LeadConfig,
  ContactConfig
}
