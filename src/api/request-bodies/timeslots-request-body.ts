import { SFReservation } from '../../s-objects/reservation'
import { SObjectAttributes } from '../../s-objects/s-object'

interface TimeSlotFields {
  [key: string]: string[]
}

interface DimensionJunctionDefinition {
  sObjectName: string
  relationshipName: string
  dimensionLookup: string
}

interface TimeSlotJunctions {
  [key: string]: TimeSlotDimensionIds[]
}

interface TimeSlotDimensionIds {
  attributes?: SObjectAttributes | undefined
  [key: string]: string | undefined | SObjectAttributes
}

interface TimeSlotContext {
  startOfRange: string
  endOfRange: string
  duration?: number | null
  interval?: number | null
}

interface TimeSlotRequestedNumberOfJunctions {
  [key: string]: number
}

export default class TimeSlotRequestBody {
  reservation?: Partial<SFReservation>
  fieldIds?: TimeSlotFields
  junctions?: TimeSlotJunctions
  requestedNumberOfJunctions?: TimeSlotRequestedNumberOfJunctions | undefined
  timeSlotContext: TimeSlotContext = {
    startOfRange: '',
    endOfRange: '',
    duration: undefined,
    interval: undefined
  }

  constructor (
    startOfRange: string,
    endOfRange: string
  ) {
    this.timeSlotContext.startOfRange = startOfRange
    this.timeSlotContext.endOfRange = endOfRange
  }
}

export {
  TimeSlotFields,
  DimensionJunctionDefinition,
  TimeSlotJunctions,
  TimeSlotDimensionIds,
  TimeSlotRequestedNumberOfJunctions
}
