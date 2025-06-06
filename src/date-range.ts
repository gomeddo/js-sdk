/**
 * A DateRange
 */
export default class DateRange {
  public startDate: Date
  public durationDays: number
  public offsetDays: number

  constructor (startDate: Date, durationDays: number, offsetDays: number) {
    this.startDate = startDate
    this.durationDays = durationDays
    this.offsetDays = offsetDays
  }
}
