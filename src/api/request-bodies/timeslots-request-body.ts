import { SFReservation } from '../../s-objects/reservation'
import { CustomFieldName, CustomRelationshipName, CustomSFSObject } from '../../s-objects/s-object'

interface TimeSlotFields {
  [key: string]: string[]
}

interface DimensionJunctionDefinition {
  sObjectName: string
  relationshipName: CustomRelationshipName
  dimensionLookup: CustomFieldName
}

interface TimeSlotJunctions {
  [key: string]: Array<Partial<CustomSFSObject>>
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
  TimeSlotRequestedNumberOfJunctions
}
