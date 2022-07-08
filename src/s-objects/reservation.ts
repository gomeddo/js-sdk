import ReservationPriceCalculationRequest from '../api/reservation-price-calculation-request'
import { ReservationSaveRequest } from '../api/reservation-save-request'
import Contact from './contact'
import Lead from './lead'
import Resource from './resource'
import SObject, { CustomSFSObject } from './s-object'
import Service from './service'
import ServiceReservation, { SFServiceReservation } from './service-reservation'

export default class Reservation extends SObject {
  private startDatetime: Date | null = null
  private endDatetime: Date | null = null
  private resource: Resource | null = null
  private contact: Contact | null = null
  private lead: Lead | null = null
  public readonly serviceReservations: ServiceReservation[] = []

  public setResource (resource: Resource): Reservation {
    this.resource = resource
    return this
  }

  public setStartDatetime (datetime: Date): Reservation {
    this.startDatetime = datetime
    return this
  }

  public setEndDatetime (datetime: Date): Reservation {
    this.endDatetime = datetime
    return this
  }

  public setContact (contact: Contact): Reservation {
    this.contact = contact
    return this
  }

  public setLead (lead: Lead): Reservation {
    this.lead = lead
    return this
  }

  public addService (service: Service, quantity: number): ServiceReservation {
    const serviceReservation = new ServiceReservation(service, quantity)
    this.serviceReservations.push(serviceReservation)
    return serviceReservation
  }

  public getReservationSaveRequest (): ReservationSaveRequest {
    return new ReservationSaveRequest(
      this.getSFSObject(),
      this.lead?.getSFSObject() ?? null,
      this.contact?.getSFSObject() ?? null,
      this.getServiceReservationRestData()
    )
  }

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

  public override getSFSObject (): Partial<SFReservation> {
    const reservationData = super.getSFSObject() as Partial<SFReservation>
    if (this.resource !== null) {
      reservationData.B25__Resource__c = this.resource.id
    }
    if (this.getStartdatetimeString() !== null) {
      reservationData.B25__Start__c = this.getStartdatetimeString()
    }
    if (this.getEnddatetimeString() !== null) {
      reservationData.B25__End__c = this.getEnddatetimeString()
    }
    return reservationData
  }

  private getServiceReservationRestData (): Array<Partial<SFServiceReservation>> {
    return this.serviceReservations.map(serviceReservation => serviceReservation.getSFSObject())
  }

  private getStartdatetimeString (): string | null {
    if (this.startDatetime === null) {
      return null
    }
    return this.startDatetime.toISOString()
  }

  private getEnddatetimeString (): string | null {
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

export {
  SFReservation
}
