import GoMeddoAPI from './api/gomeddo-api-requests'
import ReservationContactsResult from './reservation-contacts-result'

/**
 * Reservation Contacts request by default will request all Reservations Contacts in an org.
 * Reservation specific Reservation Contacts can be requested by calling withReservation(...)
 */
export default class ReservationContactsRequest {
  private readonly api: GoMeddoAPI
  private reservationId: string | null = null
  private readonly standardFields: Set<string> = new Set(['Id', 'B25__Reservation_Lookup__c', 'B25LP__Lead__c', 'B25__Contact_Lookup__c', 'B25LP__Quantity__c'])
  private readonly additionalFields: Set<string> = new Set()

  constructor (api: GoMeddoAPI) {
    this.api = api
  }

  public async getResults (): Promise<ReservationContactsResult> {
    return new ReservationContactsResult(await this.api.getReservationContacts(this.reservationId, this.getRequestedFields()))
  }

  /**
   * Request the reservation contacts for a specific reservation
   *
   * @param reservationId The id of the reservation to request the contacts for
   * @returns The updated reservation request.
   */
  public withReservation (reservationId: string): this {
    this.reservationId = reservationId
    return this
  }

  /**
   * Request an additional field to be returned for the reservation contacts
   *
   * @param fieldName The api name of the field to request
   * @returns The updated reservation request.
   */
  public includeAdditionalField (fieldName: string): this {
    this.additionalFields.add(fieldName)
    return this
  }

  /**
     * Request additional fields to be returned for the reservation contacts
     *
     * @param fieldName The api names of the fields to request
     * @returns The updated reservation request.
     */
  public includeAdditionalFields (fieldNames: Set<string> | string[]): this {
    fieldNames.forEach(fieldName => this.includeAdditionalField(fieldName))
    return this
  }

  private getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
