import { SFReservation } from '../../s-objects/reservation'
import { CustomSFSObject } from '../../s-objects/s-object'
import { SFServiceReservation } from '../../s-objects/service-reservation'

// Property names have to be exact to the endpoint
export default class ReservationPriceCalculationRequest {
  reservation: Partial<SFReservation>
  serviceReservations: Array<Partial<SFServiceReservation>>
  serviceCosts: number
  relatedRecords: Record<string, Array<Partial<CustomSFSObject>>>

  constructor (reservation: Partial<SFReservation>, serviceReservations: Array<Partial<SFServiceReservation>>, serviceCosts: number, relatedRecords: Record<string, Array<Partial<CustomSFSObject>>> = {}) {
    this.reservation = reservation
    this.serviceReservations = serviceReservations
    this.serviceCosts = serviceCosts
    this.relatedRecords = relatedRecords
  }
}
