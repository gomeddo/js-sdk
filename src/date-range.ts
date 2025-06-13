/**
 * A DateRange
 */
export default class DateRange {
  public startDate: Date
  public durationDays: number
  public offsetDays?: number

  constructor (startDate: Date = new Date(), durationDays: number = 7, offsetDays: number = 0) {
    this.startDate = startDate
    this.durationDays = durationDays
    this.offsetDays = offsetDays
  }

  public setStartDate (startDate: Date): this {
    this.startDate = startDate
    return this
  }

  public setDurationDays (durationDays: number): this {
    this.durationDays = durationDays
    return this
  }

  public setOffsetDays (offsetDays: number): this {
    this.offsetDays = offsetDays
    return this
  }
}
