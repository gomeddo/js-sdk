import GoMeddoAPI from './api/gomeddo-api-requests'
import ResourceRequest from './resource-request'
import ReservationRequest from './reservation-request'
import ResourceResult from './resource-result'
import ReservationResult from './reservation-result'
import Contact from './s-objects/contact'
import Lead from './s-objects/lead'
import Reservation from './s-objects/reservation'
import SObject from './s-objects/s-object'
import Resource from './s-objects/resource'
import Service from './s-objects/service'
import ServiceReservation, { SFServiceReservation } from './s-objects/service-reservation'
import { TimeSlot } from './time-slots/time-slot'
import { AvailabilityTimeSlot, AvailabilitySlotType } from './time-slots/availability-time-slot'
import { ServiceTimeSlot } from './time-slots/service-time-slot'
import { Condition, AndCondition, OrCondition, Operator } from './filters/conditions'
import DimensionRecordRequest from './dimension-record-request'
import TimeSlotConfiguration from './utils/time-slot-configuration'

enum Environment {
  DEVELOP,
  ACCEPTANCE,
  STAGING,
  PRODUCTION,
}

/**
 * GoMeddo object allows for interaction with GoMeddo
 */
class GoMeddo {
  static version: string = '0.0.5'
  private readonly environment: Environment
  private readonly api: GoMeddoAPI

  /**
   * @param apiKey - The api key generated from the GoMeddo general settings page.
   * @param environment - What environment to connect to. Default: Environment.PRODUCTION
   */
  constructor (apiKey: string, environment: Environment = Environment.PRODUCTION) {
    this.environment = environment
    this.api = new GoMeddoAPI(apiKey, environment)
  }

  /**
   * Creates a new request for resources. The request can then be specified using methods on the resource request.
   *
   * @returns new resource request using the authentication from this GoMeddo instance
   */
  public buildResourceRequest (): ResourceRequest {
    return new ResourceRequest(this.api)
  }

  /**
   * Creates a new request for resources. The request can then be specified using methods on the resource request.
   *
   * @returns new resource request using the authentication from this GoMeddo instance
   */
  public buildDimensionRecordRequest (dimensionName: string): DimensionRecordRequest {
    return new DimensionRecordRequest(this.api, dimensionName)
  }

  /**
   * Creates a new request for reservations. The request can then be specified using methods on the reservation request.
   *
   * @returns new reservation request using the authentication from this GoMeddo instance
   */
  public buildReservationRequest (): ReservationRequest {
    return new ReservationRequest(this.api)
  }

  /**
   * Saves a reservation object to salesforce. With the contact, lead, and service reservations added to it.
   * Behaviour and allowed opperations can be changed through settings on the salesforce org.
   *
   * @param reservation The reservation object to save
   * @returns The saved reservation object with any new values populated by the save in salesforce.
   */
  public async saveReservation (reservation: Reservation): Promise<Reservation> {
    const result = await this.api.saveReservation(reservation.getReservationSaveRequest()) as any
    const outputReservation = new Reservation()
    outputReservation.id = result.reservation.Id
    outputReservation.setStartDatetime(new Date(result.reservation.B25__Start__c))
    outputReservation.setEndDatetime(new Date(result.reservation.B25__End__c))
    const resource = reservation.getResource()
    if (resource !== null) {
      outputReservation.setResource(resource)
    }
    Object.entries(result.reservation).forEach(([fieldName, fieldValue]) => {
      outputReservation.setCustomProperty(fieldName, fieldValue)
    })
    if (result.contact !== null) {
      const contact = new Contact('', '', '') // Note these values are custom properties and will be overriden
      Object.entries(result.contact).forEach(([fieldName, fieldValue]) => {
        contact.setCustomProperty(fieldName, fieldValue)
      })
      outputReservation.setContact(contact)
    }
    if (result.lead !== null) {
      const lead = new Lead('', '', '') // Note these values are custom properties and will be overriden
      Object.entries(result.lead).forEach(([fieldName, fieldValue]) => {
        lead.setCustomProperty(fieldName, fieldValue)
      })
      outputReservation.setLead(lead)
    }
    if (result.serviceReservations !== null) {
      const serviceReservations = result.serviceReservations.map((serviceReservation: SFServiceReservation) => {
        const matchingService = reservation.serviceReservations.find(
          (originalServiceReservation) => {
            return originalServiceReservation.service.id === serviceReservation.B25__Service__c
          }
        )
        if (matchingService !== undefined) {
          const newServiceReservation = new ServiceReservation(matchingService.service, serviceReservation.B25__Quantity__c ?? 0)
          Object.entries(serviceReservation).forEach(([fieldName, fieldValue]) => {
            newServiceReservation.setCustomProperty(fieldName, fieldValue)
          })
          return newServiceReservation
        }
        return null
      }).filter((serviceReservation: any) => serviceReservation !== null)
      outputReservation.serviceReservations = serviceReservations
    }
    return outputReservation
  }

  /**
   * Updates a reservation including related sObjects.
   * Will not create contacts or leads only junction records and service reservatios.
   *
   * @param reservation The reservation to update
   */
  public async updateReservation (reservation: Reservation): Promise<void> {
    await this.updateReservations([reservation])
  }

  /**
   * Updates a list of reservations including related sObjects.
   * Will not create contacts or leads only junction records and service reservatios.
   *
   * @param reservations The reservations to update
   */
  public async updateReservations (reservations: Reservation[]): Promise<void> {
    const reservationCollections = reservations.map(reservation => reservation.getReservationCollection())
    await this.api.updateReservationCollection(reservationCollections)
  }

  /**
   * Deletes a reservation including junction sObjects and service reservations.
   *
   * @param reservation The reservation to delete
   */
  public async deleteReservation (reservation: Reservation): Promise<void> {
    await this.deleteReservations([reservation])
  }

  /**
   * Deletes a list of reservations including junction sObjects and service reservations.
   *
   * @param reservations The reservations to delete
   */
  public async deleteReservations (reservations: Reservation[]): Promise<void> {
    const reservationCollections = reservations.map(reservation => reservation.getReservationCollection())
    await this.api.deleteReservationCollection(reservationCollections)
  }

  /**
   * Sends the reservation object to salesforce to have the price calculations run.
   * The calculated price is then populated on the reservation returned.
   *
   * @param reservation The reservation to calculate the price for.
   * @returns The reservation with updated price fields.
   */
  public async calculatePrice (reservation: Reservation): Promise<Reservation> {
    const updatedPriceCalculationData = await this.api.calculatePrice(reservation.getPriceCalculationData())
    Object.entries(updatedPriceCalculationData.reservation).forEach(([fieldName, value]) => reservation.setCustomProperty(fieldName, value))
    updatedPriceCalculationData.serviceReservations.forEach((serviceReservationData: Partial<SFServiceReservation>, index: number) => {
      Object.entries(serviceReservationData).forEach(([fieldName, value]) => reservation.serviceReservations[index].setCustomProperty(fieldName, value))
    })
    const serviceCosts = reservation.serviceReservations.reduce((serviceCosts, serviceReservation) => {
      const quantity = serviceReservation.getCustomProperty('B25__Quantity__c') ?? 0
      const unitPrice = serviceReservation.getCustomProperty('B25__Unit_Price__c') ?? 0
      const vatRate = serviceReservation.getCustomProperty('B25LP__VAT_Rate__c') ?? 0
      serviceReservation.quantity = quantity
      serviceReservation.unitPrice = unitPrice
      const subtotal = quantity * unitPrice
      const subtotalIncl = subtotal + (subtotal * vatRate)
      serviceReservation.setCustomProperty('B25__Subtotal__c', subtotal)
      serviceReservation.setCustomProperty('B25LP__Subtotal_Incl__c', subtotalIncl)
      serviceCosts.serviceCosts = serviceCosts.serviceCosts + subtotal
      serviceCosts.serviceCostsIncl = serviceCosts.serviceCostsIncl + subtotalIncl
      return serviceCosts
    }, { serviceCosts: 0, serviceCostsIncl: 0 })
    reservation.setCustomProperty('B25__Service_Costs__c', serviceCosts.serviceCosts)
    reservation.setCustomProperty('B25LP__Service_Costs_Incl__c', serviceCosts.serviceCostsIncl)
    const priceFieldValue = reservation.getCustomProperty('B25__Price__c')
    const subtotalValue = (reservation.getCustomProperty('B25__Subtotal__c') ?? 0) as number
    const vatRate = (reservation.getCustomProperty('B25LP__VAT_Rate__c') ?? 0) as number
    const subtotalIncl = subtotalValue + (subtotalValue * vatRate)
    reservation.setCustomProperty('B25LP__Subtotal_Incl__c', subtotalIncl)
    reservation.setCustomProperty('B25LP__Total_Incl__c', serviceCosts.serviceCostsIncl + subtotalIncl)
    reservation.setCustomProperty('B25__Total_Price__c', priceFieldValue ?? (subtotalValue + serviceCosts.serviceCosts))
    return reservation
  }
}
export {
  Environment,
  ResourceRequest,
  DimensionRecordRequest,
  ReservationRequest,
  ResourceResult,
  ReservationResult,
  SObject,
  Reservation,
  Resource,
  Contact,
  Lead,
  Service,
  ServiceReservation,
  TimeSlot,
  AvailabilitySlotType,
  AvailabilityTimeSlot,
  ServiceTimeSlot,
  Condition,
  AndCondition,
  OrCondition,
  Operator,
  TimeSlotConfiguration
}
export default GoMeddo
