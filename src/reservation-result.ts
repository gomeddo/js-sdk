import Reservation, { SFReservation } from './s-objects/reservation'
import { isSalesforceId } from './utils/salesforce-utils'

/**
 * Result object of a resource request. Contains methods to extract resources.
 */
export default class ReservationResult {
  private readonly reservationsById: Map<string, Reservation>

  constructor (sfReservationData: SFReservation[]) {
    // Map all reservations to their ids
    this.reservationsById = sfReservationData.reduce((map, sfReservationData) => {
      const reservation = new Reservation(sfReservationData)
      map.set(reservation.id, reservation)
      return map
    }, new Map())
  }

  /**
   * @returns the number of reservations matching the request
   */
  public numberOfReservations (): number {
    return this.reservationsById.size
  }

  /**
   * @returns a list of all the reservation ids matching the requests
   */
  public getReservationIds (): string[] {
    return [...this.reservationsById.keys()]
  }

  /**
   * @param idOrName the Id or the Name of the reservation to retrieve.
   * @returns The matching reservation. Or undefined if not found.
   */
  public getReservation (idOrName: string): Reservation | undefined {
    if (isSalesforceId(idOrName)) {
      return this.reservationsById.get(idOrName)
    }
    return [...this.reservationsById.values()].find(reservation => reservation.getCustomProperty('Name') === idOrName)
  }

  /**
   * @returns a list of all the reservation matching the requests
   */
  public getReservations (): Reservation[] {
    return [...this.reservationsById.values()]
  }
}
