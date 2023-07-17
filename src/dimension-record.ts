import AvailabilityTimeSlotResponse from './api/availability-reponse'
import SObject, { CustomSFSObject } from './s-objects/s-object'
import { AvailabilitySlotType, AvailabilityTimeSlot } from './time-slots/availability-time-slot'

/**
 * A DimensionRecord
 */
export default class DimensionRecord extends SObject {
  public name: string
  protected timeSlots: AvailabilityTimeSlot[] = []

  constructor (parsedDimensionRecord: CustomSFSObject) {
    super(parsedDimensionRecord)
    this.name = parsedDimensionRecord.Name
  }

  /**
   * @internal
   * Adds availability slot data for this dimension record to the dimension record.
   */
  public addAvailabilitySlotData (slotData: AvailabilityTimeSlotResponse): void {
    this.timeSlots = slotData.timeSlots
  }

  /**
   * @internal
   * Based on the availability data checks if the dimension record has any open slots
   */
  public isClosed (): boolean {
    return !this.timeSlots.some(timeSlot => timeSlot.type === AvailabilitySlotType.OPEN)
  }

  /**
   * Gets the timeslots for this dimension record. Only available if withAvailableSlotsBetween was called.
   * @return The timeslots for this dimension record.
   */
  public getTimeSlots (): AvailabilityTimeSlot[] {
    return this.timeSlots
  }
}
