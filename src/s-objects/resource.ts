import AvailabilityTimeSlotResponse from '../api/availability-reponse'
import ResourceType from './resource-type'
import SObject from './s-object'
import { AvailabilitySlotType, AvailabilityTimeSlot } from '../time-slots/availability-time-slot'
import Service from './service'
import ServiceTimeSlotResponse from '../api/service-availability-response'
import { isSalesforceId } from '../utils/salesforce-utils'

export default class Resource extends SObject {
  public name: string
  public resourceType: ResourceType
  public parentId: string
  public parent: Resource | null = null
  public children: Resource[] = []
  public services: Map<string, Service> = new Map()
  private timeSlots: AvailabilityTimeSlot[] = []

  constructor (parsedResource: any) {
    super(parsedResource)
    this.name = parsedResource.Name
    this.parentId = parsedResource.B25__Parent__c
    this.resourceType = new ResourceType(parsedResource.B25__Resource_Type__r)
  }

  public addAvailabilitySlotData (slotData: AvailabilityTimeSlotResponse): void {
    this.timeSlots = slotData.timeSlots
  }

  public addServiceData (serviceData: ServiceTimeSlotResponse): void {
    serviceData.services.forEach(service => this.services.set(service.id, service))
  }

  public isClosed (): boolean {
    return !this.timeSlots.some(timeSlot => timeSlot.type === AvailabilitySlotType.OPEN)
  }

  public getTimeSlots (): AvailabilityTimeSlot[] {
    return this.timeSlots
  }

  public getAvailableServices (): Service[] {
    return [...this.services.values()].filter(service => service.isAvailable())
  }

  public getService (idOrName: string): Service | undefined {
    if (isSalesforceId(idOrName)) {
      return this.services.get(idOrName)
    }
    return [...this.services.values()].find(service => service.name === idOrName)
  }
}
