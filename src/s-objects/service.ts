import { ServiceTimeSlot } from '../time-slots/service-time-slot'
import SObject from './s-object'

export default class Service extends SObject {
  public readonly name: string
  public readonly timeSlots: ServiceTimeSlot[]

  constructor (serviceData: any, timeSlots: ServiceTimeSlot[]) {
    super(serviceData)
    this.name = serviceData.Name
    this.timeSlots = timeSlots
  }

  public isAvailable (): boolean {
    return this.timeSlots.some(timeslot => timeslot.remainingQuantity > 0)
  }
}
