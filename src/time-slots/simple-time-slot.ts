import { TimeSlot } from './time-slot'

export default class SimpleTimeSlot extends TimeSlot {
  hasSameData (otherSlot: SimpleTimeSlot): boolean {
    return true
  }
}
