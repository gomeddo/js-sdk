abstract class TimeSlot {
  startOfSlot: Date
  endOfSlot: Date

  constructor (startOfSlot: Date, endOfSlot: Date) {
    this.startOfSlot = startOfSlot
    this.endOfSlot = endOfSlot
  }

  abstract hasSameData (otherSlot: TimeSlot): boolean
}

enum ElementType {
  START_TYPE,
  END_TYPE
}

abstract class Builder {
  elements: BuilderElement[]
  constructor (elements: BuilderElement[]) {
    this.elements = elements.sort(BuilderElement.sortFunction)
  }

  public buildTimeline (): TimeSlot[] {
    const timeline: TimeSlot[] = []
    if (this.elements.length === 0) {
      return timeline
    }
    this.addDataFromElement(this.elements[0])
    let startOfSlot: Date = this.elements[0].elementDatetime
    for (let i = 1; i < this.elements.length; i++) {
      const element = this.elements[i]
      if (element.elementDatetime !== startOfSlot) {
        timeline.push(this.getTimeSlot(startOfSlot, element.elementDatetime))
        startOfSlot = element.elementDatetime
      }
      if (element.elementType === ElementType.START_TYPE) {
        this.addDataFromElement(element)
      } else {
        this.removeDataFromElement(element)
      }
    }
    if (timeline.length === 0 || timeline.length === 1) {
      return timeline
    }
    // Since we have checked the length of the time slots array shift will never be undefined
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    let processingSlot = timeline.shift()!
    const simplifiedSlots = [processingSlot]
    timeline.forEach((timeSlot) => {
      if (processingSlot.hasSameData(timeSlot)) {
        processingSlot.endOfSlot = timeSlot.endOfSlot
      } else {
        processingSlot = timeSlot
        simplifiedSlots.push(processingSlot)
      }
    })
    return simplifiedSlots
  }

  abstract addDataFromElement (element: BuilderElement): void
  abstract removeDataFromElement (element: BuilderElement): void
  abstract getTimeSlot (startOfSlot: Date, endOfSlot: Date): TimeSlot
}

class BuilderElement {
  public elementDatetime: Date
  public elementType: ElementType

  constructor (elementDatetime: Date, elementType: ElementType) {
    this.elementDatetime = elementDatetime
    this.elementType = elementType
  }

  public static sortFunction (elementOne: BuilderElement, elementTwo: BuilderElement): number {
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
  TimeSlot,
  Builder,
  BuilderElement,
  ElementType
}
