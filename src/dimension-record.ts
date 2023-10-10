import AvailabilityTimeSlotResponse from './api/availability-reponse'
import SObject, { CustomSFSObject } from './s-objects/s-object'
import { AvailabilitySlotType, AvailabilityTimeSlot } from './time-slots/availability-time-slot'
import SimpleTimeSlot from './time-slots/simple-time-slot'
import TimeSlotConfiguration from './utils/time-slot-configuration'

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
  * Generates dimension records time slots based on the provided configuration.
  * @return An array of the generated time slots.
  */
  public generateDimensionRecordTimeSlots (config: TimeSlotConfiguration): SimpleTimeSlot[] {
    const newGeneratedTimeSlots: SimpleTimeSlot[] = []

    this.timeSlots.forEach((timeSlot: any) => {
      if (timeSlot.type !== 0) {
        return
      }

      let startOfSlot = new Date(timeSlot.startOfSlot)
      let endOfSlot = new Date(timeSlot.endOfSlot)

      if ((config.start != null) && endOfSlot <= config.start) {
        return
      }

      if ((config.end != null) && startOfSlot >= config.end) {
        return
      }

      if ((config.start != null) && startOfSlot < config.start) {
        startOfSlot = config.start
      }

      if ((config.end != null) && endOfSlot > config.end) {
        endOfSlot = config.end
      }

      const slotDurationMs = config.slotDuration * 60000
      const slotSpacingMs = config.slotSpacing * 60000

      let startTime: Date = startOfSlot

      startTime = this.calculateSlotBoundary(startTime, config.slotBoundary)

      let newTimeSlot = null

      do {
        if (newTimeSlot != null) {
          newGeneratedTimeSlots.push(newTimeSlot)
        }

        const endTime = new Date(startTime.getTime() + slotDurationMs)
        newTimeSlot = new SimpleTimeSlot(startTime, endTime)

        startTime = new Date(startTime.getTime() + slotSpacingMs)

        startTime = this.calculateSlotBoundary(startTime, config.slotBoundary)
      } while (newTimeSlot.endOfSlot <= endOfSlot)
    })
    return newGeneratedTimeSlots
  }

  private calculateSlotBoundary (date: Date, slotBoundary: number): Date {
    if (slotBoundary > 0) {
      const boundaryOffset = date.getMinutes() % slotBoundary
      if (boundaryOffset !== 0) {
        const newDate = new Date(date.getTime())
        newDate.setMinutes(date.getMinutes() + (slotBoundary - boundaryOffset))
        return newDate
      }
    }
    return date
  }

  /**
   * Gets the timeslots for this dimension record. Only available if withAvailableSlotsBetween was called.
   * @return The timeslots for this dimension record.
   */
  public getTimeSlots (): AvailabilityTimeSlot[] {
    return this.timeSlots
  }
}
