import { ServiceTimeSlot } from '../time-slots/service-time-slot'
import SObject, { CustomSFSObject } from './s-object'

export default class Service extends SObject {
  public readonly name: string
  public readonly timeSlots: ServiceTimeSlot[]

  constructor (serviceData: SFService, timeSlots: ServiceTimeSlot[]) {
    super(serviceData)
    this.name = serviceData.Name
    this.timeSlots = timeSlots
  }

  public isAvailable (): boolean {
    return this.timeSlots.some(timeslot => timeslot.remainingQuantity > 0)
  }
}

interface SFService extends CustomSFSObject {
  B25__Default_Quantity__c?: number | null
  B25__Is_Active__c?: boolean | null
  B25__Price__c?: number | null
  B25__Service_Type__c?: string | null
}

export {
  SFService
}
