// Property names have to be exact to the endpoint
export default class ServiceTimeSlotRequest {
  rangeStart: Date
  rangeEnd: Date
  scope: string[] // resource ids if we want this to be service ids the logic here becomes more complicated and requires an extra call ?

  constructor (rangeStart: Date, rangeEnd: Date, scope: string[]) {
    this.rangeStart = rangeStart
    this.rangeEnd = rangeEnd
    this.scope = scope
  }
}
