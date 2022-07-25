import { TimeSlot } from './time-slot'

class ServiceTimeSlot extends TimeSlot {
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
