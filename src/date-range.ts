/**
 * A DateRange
 */
export default class DateRange {
  public startDate: Date
  public durationDays: number
  public offsetDays: number

  constructor () {
    this.startDate = new Date()
    this.durationDays = 7
    this.offsetDays = 0
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
