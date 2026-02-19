import GoMeddoAPI from './api/gomeddo-api-requests'
import ApexTimeSlot from './api/request-bodies/apex-time-slot'
import BlueprintTimeslotsResult from './blueprint-timeslots-result'
import DateRange from './date-range'

import { SFReservation } from './s-objects/reservation'
import { CustomSFSObject } from './s-objects/s-object'
import { ReservationCollectionTimeSlot } from './time-slots/reservation-collection-time-slot'

export default class BlueprintTimeslotsRequest {
  private readonly api: GoMeddoAPI
  private timeslotRange: DateRange = new DateRange()
  private mdaRange: DateRange = new DateRange()
  private blueprintName: string = ''
  private duration: number = 60
  private interval: number = 60
  private fixedSlots: ApexTimeSlot[] | null = null
  private prototype: Partial<SFReservation> = {}
  private relatedRecords: Record<string, Array<Partial<CustomSFSObject>>> | null = null

  constructor (api: GoMeddoAPI) {
    this.api = api
  }

  /**
   * Calls the GoMeddo APIs to construct the requested blueprint-based timeslot records.
   *
   * @returns A list of ReservationCollectionTimeSlot objects containing the requested timeslot records for the given blueprint.
   */
  public async getResults (): Promise<BlueprintTimeslotsResult> {
    const blueprintTimeslots = await this.getBlueprintTimeslots()
    return new BlueprintTimeslotsResult(blueprintTimeslots)
  }

  private async getBlueprintTimeslots (): Promise<ReservationCollectionTimeSlot[]> {
    return await this.api.getBlueprintTimeslots(this.blueprintName, this.duration, this.interval, this.timeslotRange, this.mdaRange, this.fixedSlots, this.prototype, this.relatedRecords)
  }

  public setTimeslotRange (startDate: Date, durationDays: number, offsetDays: number): this {
    this.timeslotRange = new DateRange(startDate, durationDays, offsetDays)
    return this
  }

  public setMDARange (startDate: Date, durationDays: number, offsetDays: number): this {
    this.mdaRange = new DateRange(startDate, durationDays, offsetDays)
    return this
  }

  public setBlueprintName (blueprintName: string): this {
    this.blueprintName = blueprintName
    return this
  }

  public setDuration (duration: number): this {
    this.duration = duration
    return this
  }

  public setInterval (interval: number): this {
    this.interval = interval
    return this
  }

  public setFixedSlots (fixedSlots: ApexTimeSlot[]): this {
    this.fixedSlots = fixedSlots
    return this
  }

  public setPrototype (prototype: SFReservation): this {
    this.prototype = prototype
    return this
  }

  public setRelatedRecords (relatedRecords: Record<string, Array<Partial<CustomSFSObject>>> | null): this {
    this.relatedRecords = relatedRecords
    return this
  }
}
