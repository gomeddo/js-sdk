import { AvailabilityBuilder, AvailabilityBuilderElement, AvailabilitySlotType, AvailabilityTimeSlot } from '../time-slots/availability-time-slot'
import { ElementType } from '../time-slots/time-slot'

export default class AvailabilityTimeSlotResponse {
  startOfRange: Date
  endOfRange: Date
  dimensionId: string
  timeSlots: AvailabilityTimeSlot[]

  constructor (requestResponse: any) {
    this.startOfRange = requestResponse.startDateTime
    this.endOfRange = requestResponse.endDateTime
    this.dimensionId = requestResponse.dimensionId
    this.timeSlots = []
    if (requestResponse.timeSlots.length === 0) {
      return
    }
    const builderElements = this.getBuilderElementsFromRawSlots(requestResponse.timeSlots)
    this.timeSlots = new AvailabilityBuilder(builderElements).buildTimeline() as AvailabilityTimeSlot[]
  }

  private getBuilderElementsFromRawSlots (rawslots: any[]): AvailabilityBuilderElement[] {
    return rawslots.flatMap((rawSlot) => {
      const slotType = this.parseSlotType(rawSlot.dataObject.slotType)
      return [
        new AvailabilityBuilderElement(rawSlot.startTime, ElementType.START_TYPE, slotType),
        new AvailabilityBuilderElement(rawSlot.endTime, ElementType.END_TYPE, slotType)
      ]
    })
  }

  private parseSlotType (slotType: string): AvailabilitySlotType {
    switch (slotType) {
      case 'Open': return AvailabilitySlotType.OPEN
      case 'Closed': return AvailabilitySlotType.CLOSED
      case 'Reservation': return AvailabilitySlotType.RESERVATION
      default: throw new Error('Unknown availability slot type')
    }
  }
}
