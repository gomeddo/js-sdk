// Property names have to be exact to the endpoint
export default class ServiceTimeSlotRequest {
  rangeStart: String
  rangeEnd: String
  scope: string[] // resource ids if we want this to be service ids the logic here becomes more complicated and requires an extra call ?

  constructor (rangeStart: Date, rangeEnd: Date, scope: string[]) {
    this.rangeStart = rangeStart.toISOString().split('T')[0]
    this.rangeEnd = rangeEnd.toISOString().split('T')[0]
    this.scope = scope
  }
}
