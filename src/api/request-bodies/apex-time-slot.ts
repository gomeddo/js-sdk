export default class ApexTimeSlot {
  private readonly startDatetime: Date
  private readonly endDatetime: Date

  constructor (startDatetime: Date, endDatetime: Date) {
    this.startDatetime = startDatetime
    this.endDatetime = endDatetime
  }
}
