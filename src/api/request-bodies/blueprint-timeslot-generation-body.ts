import DateRange from '../../date-range'
import { SFReservation } from '../../s-objects/reservation'

export default class BlueprintTimeslotGenerationBody {
  private readonly blueprintName: string
  private readonly duration: number
  private readonly interval: number
  private readonly timeslotRange: DateRange
  private readonly mdaRange: DateRange
  private readonly prototype: Partial<SFReservation>

  constructor (
    blueprintName: string,
    duration: number,
    interval: number,
    timeslotRange: DateRange,
    mdaRange: DateRange,
    prototype: Partial<SFReservation>
  ) {
    this.blueprintName = blueprintName
    this.duration = duration
    this.interval = interval
    this.timeslotRange = timeslotRange
    this.mdaRange = mdaRange
    this.prototype = prototype
  }
}
