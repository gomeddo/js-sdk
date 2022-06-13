import AvailabilityTimeSlotResponse from './api/availability-reponse'
import ResourceType from './resource-type'
import SObject from './s-object'
import { AvailabilitySlotType, AvailabilityTimeSlot } from './time-slots/availability-time-slot'

export default class Resource extends SObject {
  public name: string
  public resourceType: ResourceType
  public parentId: string
  public parent: Resource | null = null
  public children: Resource[] = []
  private timeSlots: AvailabilityTimeSlot[] = []

  constructor (parsedResource: any) {
    super(parsedResource, new Set(['Id', 'Name', 'B25__Resource_Type__r', 'B25__Resource_Type__c', 'B25__Parent__c']))
    this.name = parsedResource.Name
    this.parentId = parsedResource.B25__Parent__c
    this.resourceType = new ResourceType(parsedResource.B25__Resource_Type__r)
  }

  public addAvailabilitySlotData (slotData: AvailabilityTimeSlotResponse): void {
    this.timeSlots = slotData.timeSlots
  }

  public isClosed (): boolean {
    return !this.timeSlots.some(timeSlot => timeSlot.type === AvailabilitySlotType.OPEN)
  }

  public getTimeSlots (): AvailabilityTimeSlot[] {
    return this.timeSlots
  }
}
