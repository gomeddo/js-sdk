import { Builder, BuilderElement, ElementType, TimeSlot } from './time-slot'

enum AvailabilitySlotType {
  OPEN,
  CLOSED,
  RESERVATION
}

class AvailabilityTimeSlot extends TimeSlot {
  type: AvailabilitySlotType

  constructor (type: AvailabilitySlotType, startOfSlot: Date, endOfSlot: Date) {
    super(startOfSlot, endOfSlot)
    this.type = type
  }

  hasSameData (otherSlot: AvailabilityTimeSlot): boolean {
    return this.type === otherSlot.type
  }
}

class AvailabilityBuilder extends Builder {
  currentSlotData: Map<AvailabilitySlotType, number> = new Map([
    [AvailabilitySlotType.OPEN, 0],
    [AvailabilitySlotType.CLOSED, 0],
    [AvailabilitySlotType.RESERVATION, 0]
  ])

  addDataFromElement (element: AvailabilityBuilderElement): void {
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    this.currentSlotData.set(element.slotType, this.currentSlotData.get(element.slotType)! + 1)
  }

  removeDataFromElement (element: AvailabilityBuilderElement): void {
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    this.currentSlotData.set(element.slotType, this.currentSlotData.get(element.slotType)! - 1)
  }

  getTimeSlot (startOfSlot: Date, endOfSlot: Date): TimeSlot {
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    if (this.currentSlotData.get(AvailabilitySlotType.CLOSED)! > 0) {
      return new AvailabilityTimeSlot(AvailabilitySlotType.CLOSED, startOfSlot, endOfSlot)
    }
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    if (this.currentSlotData.get(AvailabilitySlotType.RESERVATION)! > 0) {
      return new AvailabilityTimeSlot(AvailabilitySlotType.RESERVATION, startOfSlot, endOfSlot)
    }
    return new AvailabilityTimeSlot(AvailabilitySlotType.OPEN, startOfSlot, endOfSlot)
  }
}

class AvailabilityBuilderElement extends BuilderElement {
  public slotType: AvailabilitySlotType

  constructor (elementDatetime: Date, elementType: ElementType, slotType: AvailabilitySlotType) {
    super(elementDatetime, elementType)
    this.slotType = slotType
  }
}

export {
  AvailabilitySlotType,
  AvailabilityTimeSlot,
  AvailabilityBuilder,
  AvailabilityBuilderElement
}
