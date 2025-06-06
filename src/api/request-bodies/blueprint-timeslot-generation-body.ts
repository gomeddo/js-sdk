import DateRange from '../../date-range'

export default class BlueprintTimeslotGenerationBody {
  private readonly blueprintName: string
  private readonly duration: number
  private readonly interval: number
  private readonly timeslotRange: DateRange
  private readonly mdaRange: DateRange

  constructor (
    blueprintName: string,
    duration: number,
    interval: number,
    timeslotRange: DateRange,
    mdaRange: DateRange
  ) {
    this.blueprintName = blueprintName
    this.duration = duration
    this.interval = interval
    this.timeslotRange = timeslotRange
    this.mdaRange = mdaRange
  }
}
