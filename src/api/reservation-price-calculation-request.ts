import { SFReservation } from '../s-objects/reservation'
import { SFServiceReservation } from '../s-objects/service-reservation'

// Property names have to be exact to the endpoint
export default class ReservationPriceCalculationRequest {
  reservation: Partial<SFReservation>
  serviceReservations: Array<Partial<SFServiceReservation>>
  serviceCosts: number

  constructor (reservation: Partial<SFReservation>, serviceReservations: Array<Partial<SFServiceReservation>>, serviceCosts: number) {
    this.reservation = reservation
    this.serviceReservations = serviceReservations
    this.serviceCosts = serviceCosts
  }
}
