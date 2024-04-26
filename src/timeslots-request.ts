import GoMeddoAPI from './api/gomeddo-api-requests'
import TimeSlotRequestBody, {
  TimeSlotFields,
  TimeSlotJunctions,
  DimensionJunctionDefinition,
  TimeSlotRequestedNumberOfJunctions
} from './api/request-bodies/timeslots-request-body'
import TimeSlotsResult from './timeslots-result'
import SObject, { CustomSFSObject } from './s-objects/s-object'
import Reservation, { SFReservation } from './s-objects/reservation'

export default class TimeSlotsRequest {
  private readonly api: GoMeddoAPI
  private readonly rangeStart: Date
  private readonly rangeEnd: Date
  private duration: number | null = null
  private interval: number | null = null
  private reservationFields: Partial<SFReservation> = {}
  private fieldIds: Partial<TimeSlotFields> = {}
  private junctions: TimeSlotJunctions = {}
  private requestedNumberOfJunctions: TimeSlotRequestedNumberOfJunctions = {}

  constructor (api: GoMeddoAPI, rangeStart: Date, rangeEnd: Date) {
    this.api = api

    if (rangeStart > rangeEnd) {
      throw new Error('TimeSlot start range cannot be greater than end range')
    }

    this.rangeStart = rangeStart
    this.rangeEnd = rangeEnd
  }

  /**
   * Set the reservation for the TimeSlots
   * @param reservation Reservation to set
   * @returns Updated TimeSlotRequest
   */
  public setReservation (reservation: Reservation): this {
    this.reservationFields = reservation.getSFSObject()
    return this
  }

  /**
     *
     * @param fieldName Name of field to add to the request
     * @param value Value of field
     * @returns Updated TimeSlotRequest
     */
  public withField (fieldName: string, fieldValue: string[] | SObject[] | string | SObject): this {
    if (Array.isArray(fieldValue)) {
      if (typeof fieldValue[0] === 'string') {
        for (const value of fieldValue) {
          const valueString = value as string
          this.setFieldId(fieldName, valueString)
        }
      } else {
        for (const value of fieldValue) {
          const valueString = typeof value !== 'string' ? value.id : value
          this.setFieldId(fieldName, valueString)
        }
      }
      return this
    }

    if (fieldValue.constructor.prototype === String.prototype) {
      const value = fieldValue as string
      return this.setFieldId(fieldName, value)
    }

    const value = fieldValue as SObject
    return this.setFieldId(fieldName, value.id)
  }

  /**
     * Add a junction to the request
     * @param dimensionJunctionDefinition The definition of the junction
     * @param junctions The list of Ids to add to the junction
     * @param requestedNumberOfJunctions The number of junctions to request
    */
  public withJunctions (dimensionJunctionDefinition: DimensionJunctionDefinition, dimensionIds: string[], requestedNumberOfJunctions?: number): this {
    const { sObjectName, relationshipName, dimensionLookup } = dimensionJunctionDefinition

    if (typeof requestedNumberOfJunctions !== 'undefined') {
      if (requestedNumberOfJunctions <= 0) {
        throw new Error('The requested number of junctions cannot be negative or zero')
      }
      if (requestedNumberOfJunctions > dimensionIds.length) {
        throw new Error('The requested number of junctions cannot be greater than the number of dimensionIds provided')
      }

      this.requestedNumberOfJunctions[relationshipName] = requestedNumberOfJunctions
    }

    const junctionsList: Array<Partial<CustomSFSObject>> = dimensionIds.map((dimensionId) => {
      const junctionRecord: Partial<CustomSFSObject> = {
        attributes: { type: sObjectName }
      }
      junctionRecord[dimensionLookup] = dimensionId
      return junctionRecord
    })

    this.junctions[relationshipName] = junctionsList

    return this
  }

  /**
     * Set the duration for the TimeSlots
     * @param duration TimeSlot duration in minutes
     * @returns Updated TimeSlotRequest
     * @throws Error if the duration is negative or zero
     */
  public withDuration (duration: number): this {
    if (duration <= 0) {
      throw new Error('TimeSlot duration cannot be negative or zero')
    }
    this.duration = duration
    return this
  }

  /**
     * Set the interval for the TimeSlots
     * @param interval TimeSlot interval in minutes
     * @returns Updated TimeSlotRequest
    */
  public withInterval (interval: number): this {
    if (interval <= 0) {
      throw new Error('TimeSlot interval cannot be negative or zero')
    }
    this.interval = interval
    return this
  }

  /**
     *
     * @returns The results of the TimeSlots request
     */
  public async getResults (): Promise<TimeSlotsResult> {
    const timeSlotRequest = new TimeSlotRequestBody(this.rangeStart.toISOString(), this.rangeEnd.toISOString())
    const fieldIds = this.processFieldIds(this.fieldIds)

    timeSlotRequest.reservation = Object.keys(this.reservationFields).length > 0 ? this.reservationFields : undefined
    timeSlotRequest.fieldIds = Object.keys(fieldIds).length > 0 ? fieldIds : undefined
    timeSlotRequest.junctions = Object.keys(this.junctions).length > 0 ? this.junctions : undefined
    timeSlotRequest.requestedNumberOfJunctions = Object.keys(this.requestedNumberOfJunctions).length > 0 ? this.requestedNumberOfJunctions : undefined
    timeSlotRequest.timeSlotContext.duration = this.duration ?? undefined
    timeSlotRequest.timeSlotContext.interval = this.interval ?? undefined

    return new TimeSlotsResult(await this.api.getTimeSlots(timeSlotRequest), this.rangeStart, this.rangeEnd)
  }

  private processFieldIds (fieldIds: Partial<TimeSlotFields>): TimeSlotFields {
    for (const [key, value] of Object.entries(fieldIds)) {
      if (value?.length === 1) {
        this.reservationFields[key as keyof Partial<SFReservation>] = value[0] as any
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete fieldIds[key]
      }
    }
    return fieldIds as TimeSlotFields
  }

  private setFieldId (fieldName: string, fieldValue: string): this {
    if (fieldValue === undefined) {
      return this
    }

    this.fieldIds[fieldName] = [...(this.fieldIds[fieldName] ?? []), fieldValue]
    return this
  }
}
