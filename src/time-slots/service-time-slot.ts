import { TimeSlot } from './time-slot'

/**
 * A timeslot of service availability
 */
class ServiceTimeSlot extends TimeSlot {
  // The remaining quantity for the service
  remainingQuantity: number

  constructor (remainingQuantity: number, startOfSlot: Date, endOfSlot: Date) {
    super(startOfSlot, endOfSlot)
    this.remainingQuantity = remainingQuantity
  }

  hasSameData (otherSlot: ServiceTimeSlot): boolean {
    return this.remainingQuantity === otherSlot.remainingQuantity
  }
}

export {
  ServiceTimeSlot
}
