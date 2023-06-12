import AvailabilityTimeSlotResponse from '../api/availability-reponse'
import SObject, { CustomSFSObject } from './s-object'
import { AvailabilitySlotType, AvailabilityTimeSlot } from '../time-slots/availability-time-slot'
import Service from './service'
import ServiceTimeSlotResponse from '../api/service-availability-response'
import TimeSlotConfiguration from '../utils/time-slot-configuration'
import { isSalesforceId } from '../utils/salesforce-utils'
import SimpleTimeSlot from '../time-slots/simple-time-slot'

/**
 * A Resource
 */
export default class Resource extends SObject {
  public name: string
  public parentId: string | null
  public parent: Resource | null = null
  public children: Resource[] = []
  public services: Map<string, Service> = new Map()
  private timeSlots: AvailabilityTimeSlot[] = []

  constructor (parsedResource: SFResource) {
    super(parsedResource)
    this.name = parsedResource.Name
    this.parentId = parsedResource.B25__Parent__c ?? null
  }

  /**
   * @internal
   * Adds availability slot data for this resource to the resource.
   */
  public addAvailabilitySlotData (slotData: AvailabilityTimeSlotResponse): void {
    this.timeSlots = slotData.timeSlots
  }

  /**
   * @internal
   * Adds service availability slot data for this resource to the resource.
   */
  public addServiceData (serviceData: ServiceTimeSlotResponse): void {
    serviceData.services.forEach(service => this.services.set(service.id, service))
  }

  /**
   * @internal
   * Based on the availability data checks if the resource has any open slots
   */
  public isClosed (): boolean {
    return !this.timeSlots.some(timeSlot => timeSlot.type === AvailabilitySlotType.OPEN)
  }

  /**
   * Generates resource time slots based on the provided configuration.
   * @return An array of the generated time slots.
   */
  public generateResourceTimeSlots (config: TimeSlotConfiguration): SimpleTimeSlot[] {
    const newGeneratedTimeSlots: SimpleTimeSlot[] = []

    this.timeSlots.forEach((timeSlot: any) => {
      if (timeSlot.type !== 0) {
        return
      }

      let startOfSlot = new Date(timeSlot.startOfSlot)
      let endOfSlot = new Date(timeSlot.endOfSlot)

      if ((config.start != null) && endOfSlot <= config.start) {
        return
      }

      if ((config.end != null) && startOfSlot >= config.end) {
        return
      }

      if ((config.start != null) && startOfSlot < config.start) {
        startOfSlot = config.start
      }

      if ((config.end != null) && endOfSlot > config.end) {
        endOfSlot = config.end
      }

      const slotDurationMs = config.slotDuration * 60000
      const slotSpacingMs = config.slotSpacing * 60000

      let startTime: Date = startOfSlot

      startTime = this.calculateSlotBoundary(startTime, config.slotBoundary)

      let newTimeSlot = null

      do {
        if (newTimeSlot != null) {
          newGeneratedTimeSlots.push(newTimeSlot)
        }

        const endTime = new Date(startTime.getTime() + slotDurationMs)
        newTimeSlot = new SimpleTimeSlot(startTime, endTime)

        startTime = new Date(startTime.getTime() + slotSpacingMs)

        startTime = this.calculateSlotBoundary(startTime, config.slotBoundary)
      } while (newTimeSlot.endOfSlot <= endOfSlot)
    })
    return newGeneratedTimeSlots
  }

  private calculateSlotBoundary (date: Date, slotBoundary: number): Date {
    if (slotBoundary > 0) {
      const boundaryOffset = date.getMinutes() % slotBoundary
      if (boundaryOffset !== 0) {
        const newDate = new Date(date.getTime())
        newDate.setMinutes(date.getMinutes() + (slotBoundary - boundaryOffset))
        return newDate
      }
    }
    return date
  }

  /**
   * Gets the timeslots for this resource. Only available if withAvailableSlotsBetween was called.
   * @return The timeslots for this resource.
   */
  public getTimeSlots (): AvailabilityTimeSlot[] {
    return this.timeSlots
  }

  /**
   * Gets the available service for this resource. Only available if withAvailableSlotsBetween, and includeServices were called.
   * @return The available services for this resource.
   */
  public getAvailableServices (): Service[] {
    return [...this.services.values()].filter(service => service.isAvailable())
  }

  /**
   * @param idOrName The id or name of the service
   * @returns The service or undefined if not found
   */
  public getService (idOrName: string): Service | undefined {
    if (isSalesforceId(idOrName)) {
      return this.services.get(idOrName)
    }
    return [...this.services.values()].find(service => service.name === idOrName)
  }
}

interface SFResource extends CustomSFSObject {
  B25__Api_Visible__c?: boolean | null
  B25__Base_Price__c?: number | null
  B25__Booker25_Id__c?: string | null
  B25__Capacity__c?: number | null
  B25__Context__c?: string | null
  B25__Default_Price__c?: number | null
  B25__Default_Price_Calculation__c?: string | null
  B25__Description__c?: string | null
  B25__Full_Path__c?: string | null
  B25__Image_Url__c?: string | null
  B25__Is_Active__c?: boolean | null
  B25__IsVirtual__c?: boolean | null
  B25__Materialized_Path__c?: string | null
  B25__MaxCapacity__c?: number | null
  B25__MaxLayoutCapacity__c?: number | null
  B25__NumberOfActiveLayouts__c?: number | null
  B25__Order__c?: number | null
  B25__Parent__c?: string | null
  B25__Resource_Type__c?: string | null
  B25__Timezone__c?: string | null
}

export {
  SFResource
}
