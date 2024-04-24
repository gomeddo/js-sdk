import ReservationContact, { SFReservationContact } from './s-objects/reservation-contact'
import { isSalesforceId } from './utils/salesforce-utils'

/**
 * Result object of a Reservations Contacts request. Contains methods to extract Reservation Contact.
 */
export default class ReservationContactsResult {
  private readonly reservationContactsById: Map<string, ReservationContact>

  constructor (sfReservationContactData: SFReservationContact[]) {
    // Map all reservation contacts to their ids
    this.reservationContactsById = sfReservationContactData.reduce((map, sfReservationContactData) => {
      const reservationContact = new ReservationContact(sfReservationContactData)
      map.set(reservationContact.id, reservationContact)
      return map
    }, new Map())
  }

  /**
     * @returns the number of reservation contacts matching the request
     */
  public numberOfReservationContacts (): number {
    return this.reservationContactsById.size
  }

  /**
     * @returns a list of all the reservation contact ids matching the requests
     */
  public getReservationContactIds (): string[] {
    return [...this.reservationContactsById.keys()]
  }

  /**
     * @param idOrName the Id or the Name of the reservation contact to retrieve.
     * @returns The matching reservation contact. Or undefined if not found.
     */
  public getReservationContact (idOrName: string): ReservationContact | undefined {
    if (isSalesforceId(idOrName)) {
      return this.reservationContactsById.get(idOrName)
    }
    return [...this.reservationContactsById.values()].find(reservationContact => reservationContact.getCustomProperty('Name') === idOrName)
  }
}
