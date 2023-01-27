import ReservationCollection from '../api/request-bodies/reservation-collection'
import ReservationPriceCalculationRequest from '../api/request-bodies/reservation-price-calculation-request'
import { ReservationSaveRequest } from '../api/request-bodies/reservation-save-request'
import { isSalesforceId } from '../utils/salesforce-utils'
import Contact from './contact'
import Lead from './lead'
import Resource from './resource'
import SObject, { CustomSFSObject, StandardSFSObject } from './s-object'
import Service from './service'
import ServiceReservation, { SFServiceReservation } from './service-reservation'

export default class Reservation extends SObject {
  private startDatetime: Date | null = null
  private endDatetime: Date | null = null
  private resource: Resource | null = null
  private contact: Contact | null = null
  private lead: Lead | null = null
  public serviceReservations: ServiceReservation[] = []
  public relatedRecords: Map<string, Array<Partial<CustomSFSObject>>> = new Map()
  public removedRelatedRecords: Map<string, Array<Partial<CustomSFSObject>>> = new Map()

  /**
   * Attatch this reservation to the given resource.
   *
   * @param resource The resource to attatch this reservation to.
   * @returns This reservation
   */
  public setResource (resource: Resource): Reservation {
    this.resource = resource
    return this
  }

  /**
   * Get the resource this reservation is currently attatched to.
   *
   * @returns The resource this reservation is attached to.
   */
  public getResource (): Resource | null {
    return this.resource
  }

  /**
   * @param datetime The start datetime to set on the reservation (GMT)
   * @returns This reservation
   */
  public setStartDatetime (datetime: Date): Reservation {
    this.startDatetime = datetime
    return this
  }

  /**
   * Get the reservation start date time.
   *
   * @returns This reservation startDatetime
   */
  public getStartDatetime (): Date | null {
    return this.startDatetime
  }

  /**
   * @param datetime The end datetime to set on the reservation (GMT)
   * @returns This reservation
   */
  public setEndDatetime (datetime: Date): Reservation {
    this.endDatetime = datetime
    return this
  }

  /**
   * Get the reservation end date time.
   *
   * @returns This reservation endDatetime
   */
  public getEndDatetime (): Date | null {
    return this.endDatetime
  }

  /**
   * Sets a contact to be attached to this reservation. This contact will either be linked through reservation contact or through the contact lookup.
   * This can be configured in salesforce. The contact will be duplicate checked and the existing contact will be linked instead if already found.
   *
   * @param contact The contact to attach to the reservation
   * @returns This reservation
   */
  public setContact (contact: Contact): Reservation {
    this.contact = contact
    return this
  }

  /**
   * Sets a lead to be attached to this reservation. This lead will be linked through the lead lookup.
   * The lead will be duplicate checked and the existing lead will be linked instead if already found.
   *
   * @param lead The lead to attach to the reservation
   * @returns This reservation
   */
  public setLead (lead: Lead): Reservation {
    this.lead = lead
    return this
  }

  /**
   * Creates a service reservation and attaches it to the reservation.
   *
   * @param service The service to reserve
   * @param quantity The quantity to reserve
   * @returns The service reservation created.
   */
  public addService (service: Service, quantity: number): ServiceReservation {
    const serviceReservation = new ServiceReservation(service, quantity)
    this.serviceReservations.push(serviceReservation)
    this.addRelatedRecord('B25__Service_Reservation__c', serviceReservation.getSFSObject())
    return serviceReservation
  }

  /**
   * Add a reservation contact record to the reservation.
   * Is only persisted through the update/delete reservation methods does not work with saveReservation
   *
   * @param reservationContactSObject the reservation contact to add to the reservation
   */
  public addReservationContact (reservationContactSObject: Partial<CustomSFSObject>): void {
    this.addRelatedRecord('B25__ReservationContact__c', reservationContactSObject)
  }

  /**
   * Add a related record to the reservation.
   * Has to be a configured junction in GoMeddo.
   * Is only persisted through the update/delete reservation methods does not work with saveReservation
   *
   * @param relatedRecordApiName
   * @param relatedRecord
   */
  public addRelatedRecord (relatedRecordApiName: string, relatedRecord: Partial<CustomSFSObject>): void {
    let relatedRecordsList = this.relatedRecords.get(relatedRecordApiName)
    if (relatedRecordsList === undefined) {
      relatedRecordsList = []
      this.relatedRecords.set(relatedRecordApiName, relatedRecordsList)
    }
    relatedRecordsList.push(relatedRecord)
  }

  /**
   * Remove a related record from the reservation.
   * Is only persisted through the update reservation methods does not work with saveReservation or deleteReservation
   *
   * @param reservationContactSObject the reservation contact to remove
   */
  public removeReservationContact (reservationContactSObject: Partial<CustomSFSObject>): void {
    this.removeRelatedRecord('B25__ReservationContact__c', reservationContactSObject)
  }

  /**
   * Remove a related record form the reservation.
   * Has to be a configured junction in GoMeddo.
   * Is only persisted through the update reservation methods does not work with saveReservation or deleteReservation
   *
   * @param relatedRecordApiName
   * @param relatedRecord
   */
  public removeRelatedRecord (relatedRecordApiName: string, relatedRecord: Partial<CustomSFSObject>): void {
    if (relatedRecord.Id === undefined || !isSalesforceId(relatedRecord.Id)) {
      throw new Error('Related records can\t be deleted if they don\'t have a salesforce Id')
    }
    let relatedRecordsList = this.removedRelatedRecords.get(relatedRecordApiName)
    if (relatedRecordsList === undefined) {
      relatedRecordsList = []
      this.removedRelatedRecords.set(relatedRecordApiName, relatedRecordsList)
    }
    relatedRecordsList.push(relatedRecord)
  }

  /**
   * @internal
   * @returns Save request data for this reservation
   */
  public getReservationSaveRequest (): ReservationSaveRequest {
    return new ReservationSaveRequest(
      this.getSFSObject(),
      this.getLead(),
      this.getContact(),
      this.getServiceReservationRestData()
    )
  }

  /**
   * @internal
   * @returns Reservation Collection for this reservation
   */
  public getReservationCollection (): ReservationCollection {
    const reservation = this.getSFSObject()
    if (isReservation(reservation)) {
      return new ReservationCollection(
        reservation,
        this.relatedRecords,
        this.removedRelatedRecords
      )
    }
    throw Error('Updating or deleting the reservation requires the reservation to have an Id.')
  }

  /**
   * @internal
   * @returns Price calculation request data for this reservation
   */
  public getPriceCalculationData (): ReservationPriceCalculationRequest {
    return new ReservationPriceCalculationRequest(
      this.getSFSObject(),
      this.getServiceReservationRestData(),
      this.serviceReservations.reduce((serviceCosts, serviceReservation) => {
        const quantity = serviceReservation.quantity ?? 0
        const unitPrice = serviceReservation.unitPrice ?? 0
        return serviceCosts + (quantity * unitPrice)
      }, 0)
    )
  }

  /**
   * @internal
   * @returns The Salesforce formatted data for the reservation
   */
  public override getSFSObject (): Partial<SFReservation> {
    const reservationData = super.getSFSObject() as Partial<SFReservation>
    if (this.resource !== null) {
      reservationData.B25__Resource__c = this.resource.id
    }
    if (this.getStartDatetimeString() !== null) {
      reservationData.B25__Start__c = this.getStartDatetimeString()
    }
    if (this.getEndDatetimeString() !== null) {
      reservationData.B25__End__c = this.getEndDatetimeString()
    }
    return reservationData
  }

  /**
   * @internal
   * @returns The Salesforce formatted data for the lead
   */
  private getLead (): Partial<StandardSFSObject> | null {
    if (this.lead === null) {
      return null
    }
    return this.lead.getSFSObject()
  }

  /**
   * @internal
   * @returns The Salesforce formatted data for the contact
   */
  private getContact (): Partial<StandardSFSObject> | null {
    if (this.contact === null) {
      return null
    }
    return this.contact.getSFSObject()
  }

  /**
   * @internal
   * @returns The Salesforce formatted data for the servuce reservations
   */
  private getServiceReservationRestData (): Array<Partial<SFServiceReservation>> {
    return this.serviceReservations.map(serviceReservation => serviceReservation.getSFSObject())
  }

  /**
   * @internal
   * @returns A string representing the startdatetime
   */
  private getStartDatetimeString (): string | null {
    if (this.startDatetime === null) {
      return null
    }
    return this.startDatetime.toISOString()
  }

  /**
   * @internal
   * @returns A string representing the enddatetime
   */
  private getEndDatetimeString (): string | null {
    if (this.endDatetime === null) {
      return null
    }
    return this.endDatetime.toISOString()
  }
}

interface SFReservation extends CustomSFSObject {
  B25__ABRCompositeKey__c?: string | null
  B25__ABRSerialNr__c?: number | null
  B25__ABRSerialPartNr__c?: number | null
  B25__Account__c?: string | null
  B25__Additional_Attendees__c?: string | null
  B25__Additional_Google_Data__c?: string | null
  B25__Additional_Outlook_Data__c?: string | null
  B25__AutomatedBookingRule__c?: string | null
  B25__Base_Price__c?: number | null
  B25__Calculation_Method__c?: string | null
  B25__Contact__c?: string | null
  B25__End__c?: string | null
  B25__End_Buffer_Duration__c?: number | null
  B25__End_Date__c?: string | null
  B25__End_GMT__c?: string | null
  B25__End_Local_DateTime__c?: string | null
  B25__EndLocal__c?: string | null
  B25__Event_Id__c?: string | null
  B25__Google_Id__c?: string | null
  B25__Group__c?: string | null
  B25__Has_Conflicts__c?: boolean | null
  B25__Has_Resource_Conflicts__c?: boolean | null
  B25__Has_Staff_Conflicts__c?: boolean | null
  B25__Hover__c?: string | null
  B25__Info__c?: string | null
  B25__IsUnassigned__c?: boolean | null
  B25__Lead__c?: string | null
  B25__Local_End_Time__c?: string | null
  B25__Local_Start_Time__c?: string | null
  B25__MaxCapacity__c?: number | null
  B25__Notes__c?: string | null
  B25__Opportunity__c?: string | null
  B25__OpportunityLineItem__c?: string | null
  B25__Outlook_Series_Master_Id__c?: string | null
  B25__Price__c?: number | null
  B25__Quantity__c?: number | null
  B25__Recurring_Reservation__c?: string | null
  B25__Reservation_Template__c?: string | null
  B25__Reservation_Type__c?: string | null
  B25__Resource__c?: string | null
  B25__ResourceName__c?: string | null
  B25__ResourceTimezone__c?: string | null
  B25__Sample_Custom_Field__c?: string | null
  B25__SelectedLayout__c?: string | null
  B25__SelectedTimeframe__c?: string | null
  B25__Service_Costs__c?: number | null
  B25__Skip_Subtotal_Calculation__c?: boolean | null
  B25__Staff__c?: string | null
  B25__Start__c?: string | null
  B25__Start_Buffer_Duration__c?: number | null
  B25__Start_Date__c?: string | null
  B25__Start_GMT__c?: string | null
  B25__Start_Local_DateTime__c?: string | null
  B25__StartLocal__c?: string | null
  B25__Status__c?: string | null
  B25__Subtotal__c?: number | null
  B25__Title__c?: string | null
  B25__Total_Price__c?: number | null
  B25__Unique_Outlook_Id__c?: string | null
  B25__User__c?: string | null
  B25__Visit__c?: string | null
  B25__What_Is_This__c?: string | null
}

const isReservation = (reservation: Partial<SFReservation>): reservation is SFReservation => {
  return reservation.Id !== undefined && reservation.Id !== null
}
export {
  SFReservation,
  isReservation
}
