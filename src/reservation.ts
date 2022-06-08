import Resource from './resource'

export default class Reservation {
  private readonly customProperties: Map<string, any>
  private resource: Resource | null = null

  constructor () {
    this.customProperties = new Map()
  }

  public setResource (resource: Resource): void {
    this.resource = resource
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
    if (this.resource !== null) {
      reservationData.B25__Resource__c = this.resource.id
    }
    return {
      reservation: reservationData
    }
  }
}
