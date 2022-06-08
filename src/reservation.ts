
export default class Reservation {
  private readonly customProperties: Map<string, any>

  constructor () {
    this.customProperties = new Map()
  }

  public setCustomProperty (propertyName: string, value: any): void {
    this.customProperties.set(propertyName, value)
  }

  public getCustomProperty (propertyName: string): any {
    return this.customProperties.get(propertyName)
  }

  public getRestData (): object {
    const reservationData: { [key: string]: any } = {}
    this.customProperties.forEach((value, fieldName) => {
      reservationData[fieldName] = value
    })
    return {
      reservation: reservationData
    }
  }
}
