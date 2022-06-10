// Property names have to be exact to the endpoint
class AvailabilityTimeslotsRequestBody {
  rangeStart: Date
  rangeEnd: Date
  dimensionName: string = 'B25__Resource__c'
  scope: string[]
  reservation: { [key: string]: any } = {}
  includeNonConflictingReservations: boolean = false

  constructor (rangeStart: Date, rangeEnd: Date, scope: string[]) {
    this.rangeStart = rangeStart
    this.rangeEnd = rangeEnd
    this.scope = scope
  }
}

class DimensionAvailabilityTimeslots {
  startOfRange: Date
  endOfRange: Date
  dimensionId: string
  timeSlots: TimeSlot[]

  constructor (requestResponse: any) {
    this.startOfRange = requestResponse.startDateTime
    this.endOfRange = requestResponse.endDateTime
    this.dimensionId = requestResponse.dimensionId
    this.timeSlots = []
    if (requestResponse.timeSlots.length === 0) {
      return
    }
    const builderElements = this.getBuilderElementsFromRawSlots(requestResponse.timeSlots)
    builderElements.sort(TimelineBuilderElement.sortFunction)
    const currentSlotTypes: SlotType[] = [builderElements[0].slotType]
    let currentStartDate: Date = builderElements[0].elementDatetime
    for (let i = 1; i < builderElements.length; i++) {
      const element = builderElements[i]
      if (element.elementDatetime !== currentStartDate) {
        const slotType = this.reduceSlotTypes(currentSlotTypes)
        this.timeSlots.push(new TimeSlot(slotType, currentStartDate, element.elementDatetime))
        currentStartDate = element.elementDatetime
      }
      if (element.elementType === ElementType.START_TYPE) {
        currentSlotTypes.push(element.slotType)
      } else {
        currentSlotTypes.splice(currentSlotTypes.indexOf(element.slotType), 1)
      }
    }
    this.simplifyTimeline()
  }

  private getBuilderElementsFromRawSlots (rawslots: any[]): TimelineBuilderElement[] {
    return rawslots.flatMap((rawSlot) => {
      const slotType = this.parseSlotType(rawSlot.dataObject.slotType)
      return [
        new TimelineBuilderElement(rawSlot.startTime, ElementType.START_TYPE, slotType),
        new TimelineBuilderElement(rawSlot.endTime, ElementType.END_TYPE, slotType)
      ]
    })
  }

  private parseSlotType (slotType: string): SlotType {
    switch (slotType) {
      case 'Open': return SlotType.OPEN
      case 'Closed': return SlotType.CLOSED
      case 'Reservation': return SlotType.RESERVATION
      default: throw new Error('Unknown slot type')
    }
  }

  private reduceSlotTypes (slotTypes: SlotType[]): SlotType {
    let currentSlotType: SlotType = slotTypes[0]
    for (let i = 0; i < slotTypes.length; i++) {
      const slotType = slotTypes[i]
      if (slotType === SlotType.CLOSED) {
        return SlotType.CLOSED
      }
      if (currentSlotType === SlotType.RESERVATION) {
        continue
      }
      currentSlotType = slotType
    }
    return currentSlotType
  }

  simplifyTimeline (): void {
    if (this.timeSlots.length === 0 || this.timeSlots.length === 1) {
      return
    }
    // Since we have checked the length of the timeslots array shift will never be undefined
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    let processingSlot = this.timeSlots.shift()!
    const newTimeSlots = [processingSlot]
    this.timeSlots.forEach((timeSlot) => {
      if (processingSlot.type === timeSlot.type) {
        processingSlot.endOfSlot = timeSlot.endOfSlot
      } else {
        processingSlot = timeSlot
        newTimeSlots.push(processingSlot)
      }
    })
    this.timeSlots = newTimeSlots
  }
}

enum SlotType {
  OPEN,
  CLOSED,
  RESERVATION
}

// Currently ignores conflicting fields if we have a use for it later we can simply add properties for it
class TimeSlot {
  type: SlotType
  startOfSlot: Date
  endOfSlot: Date

  constructor (type: SlotType, startOfSlot: Date, endOfSlot: Date) {
    this.type = type
    this.startOfSlot = startOfSlot
    this.endOfSlot = endOfSlot
  }
}

enum ElementType {
  START_TYPE,
  END_TYPE
}

class TimelineBuilderElement {
  public elementDatetime: Date
  public elementType: ElementType
  public slotType: SlotType

  constructor (elementDatetime: Date, elementType: ElementType, slotType: SlotType) {
    this.elementDatetime = elementDatetime
    this.elementType = elementType
    this.slotType = slotType
  }

  public static sortFunction (elementOne: TimelineBuilderElement, elementTwo: TimelineBuilderElement): number {
    if (elementOne.elementDatetime === elementTwo.elementDatetime) {
      if (elementOne.elementType === elementTwo.elementType) {
        return 0
      }
      // It is important that start elements come before end elements in builder timelines
      if (elementOne.elementType === ElementType.START_TYPE) {
        return -1
      }
      return 1
    }
    if (elementOne.elementDatetime < elementTwo.elementDatetime) {
      return -1
    }
    return 1
  }
}
export {
  AvailabilityTimeslotsRequestBody,
  DimensionAvailabilityTimeslots,
  SlotType,
  TimeSlot
}
