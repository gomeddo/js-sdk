import { DimensionAvailabilityTimeslots, SlotType, TimeSlot } from './availability-timeslots'
import ResourceType from './resource-type'
import SObject from './s-object'

export default class Resource extends SObject {
  public name: string
  public resourceType: ResourceType
  public parentId: string
  public parent: Resource | null = null
  public children: Resource[] = []
  private timeslots: TimeSlot[] = []

  constructor (parsedResource: any) {
    super(parsedResource, new Set(['Id', 'Name', 'B25__Resource_Type__r', 'B25__Resource_Type__c', 'B25__Parent__c']))
    this.name = parsedResource.Name
    this.parentId = parsedResource.B25__Parent__c
    this.resourceType = new ResourceType(parsedResource.B25__Resource_Type__r)
  }

  public addAvailabilitySlotData (slotData: DimensionAvailabilityTimeslots): void {
    this.timeslots = slotData.timeSlots
  }

  public isClosed (): boolean {
    return !this.timeslots.some(timeslot => timeslot.type === SlotType.OPEN)
  }

  public getTimeslots (): TimeSlot[] {
    return this.timeslots
  }
}
