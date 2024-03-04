import SObject, { CustomSFSObject } from './s-object'

/**
 * ReservationContact object
 */
export default class ReservationContact extends SObject {
  public reservationId: string | null = null
  public leadId: string | null = null
  public contactLookupId: string | null = null
  public quantity: number | null = null

  constructor (sfReservationContactData: SFReservationContact) {
    super(sfReservationContactData)
    this.reservationId = sfReservationContactData.B25__Reservation_Lookup__c ?? null
    this.leadId = sfReservationContactData.B25LP__Lead__c ?? null
    this.contactLookupId = sfReservationContactData.B25__Contact_Lookup__c ?? null
    this.quantity = sfReservationContactData.B25LP__Quantity__c ?? null
  }
}

interface SFReservationContact extends CustomSFSObject {
  B25__Reservation_Lookup__c?: string | null
  B25LP__Lead__c?: string | null
  B25__Contact_Lookup__c?: string | null
  B25LP__Quantity__c?: number | null
  B25__Reservation_Resource__c?: string | null
  B25__Reservation_Start_Time__c?: string | null
  B25__Reservation_End_Time__c?: string | null
  B25__QR_Code__c?: string | null
  B25__QR_Code_Url__c?: string | null
  B25__CheckedIn__c?: boolean | null
  B25LP__External_Id__c?: string | null
}

export {
  SFReservationContact
}
