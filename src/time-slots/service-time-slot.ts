import { Builder, BuilderElement, ElementType, TimeSlot } from './time-slot'

// Note this class will probably change when the endpoint is created.
// How we will handle availabilities is something that has to be decided
enum ServiceSlotType {
  AVAILABILITY,
  RESERVATION
}

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

class ServiceBuilder extends Builder {
  remainingQuantity: number = 0

  addDataFromElement (element: ServiceBuilderElement): void {
    if (element.type === ServiceSlotType.AVAILABILITY) {
      this.remainingQuantity += element.quantity
    } else {
      this.remainingQuantity -= element.quantity
    }
  }

  removeDataFromElement (element: ServiceBuilderElement): void {
    if (element.type === ServiceSlotType.AVAILABILITY) {
      this.remainingQuantity -= element.quantity
    } else {
      this.remainingQuantity += element.quantity
    }
  }

  getTimeSlot (startOfSlot: Date, endOfSlot: Date): TimeSlot {
    return new ServiceTimeSlot(this.remainingQuantity, startOfSlot, endOfSlot)
  }
}

class ServiceBuilderElement extends BuilderElement {
  public type: ServiceSlotType
  public quantity: number

  constructor (elementDatetime: Date, elementType: ElementType, quantity: number, type: ServiceSlotType) {
    super(elementDatetime, elementType)
    this.type = type
    this.quantity = quantity
  }
}

export {
  ServiceSlotType,
  ServiceTimeSlot,
  ServiceBuilder,
  ServiceBuilderElement
}
