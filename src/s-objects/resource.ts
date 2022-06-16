import AvailabilityTimeSlotResponse from '../api/availability-reponse'
import ResourceType from './resource-type'
import SObject, { CustomSFSObject } from './s-object'
import { AvailabilitySlotType, AvailabilityTimeSlot } from '../time-slots/availability-time-slot'
import Service from './service'
import ServiceTimeSlotResponse from '../api/service-availability-response'
import { isSalesforceId } from '../utils/salesforce-utils'

export default class Resource extends SObject {
  public name: string
  public resourceType: ResourceType
  public parentId: string | null
  public parent: Resource | null = null
  public children: Resource[] = []
  public services: Map<string, Service> = new Map()
  private timeSlots: AvailabilityTimeSlot[] = []

  constructor (parsedResource: SFResource) {
    super(parsedResource)
    this.name = parsedResource.Name
    this.parentId = parsedResource.B25__Parent__c ?? null
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
