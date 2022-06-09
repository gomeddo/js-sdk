import Resource from './resource'

export default class Reservation {
  private readonly customProperties: Map<string, any>
  private startDatetime: Date | null = null
  private endDatetime: Date | null = null
  private resource: Resource | null = null

  constructor () {
    this.customProperties = new Map()
  }

  public setResource (resource: Resource): Reservation {
    this.resource = resource
    return this
  }

  public setStartDatetime (datetime: Date): Reservation {
    this.startDatetime = datetime
    return this
  }

  public setEndDatetime (datetime: Date): Reservation {
    this.endDatetime = datetime
    return this
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
    if (this.getStartdatetimeString() !== null) {
      reservationData.B25__Start__c = this.getStartdatetimeString()
    }
    if (this.getEnddatetimeString() !== null) {
      reservationData.B25__End__c = this.getEnddatetimeString()
    }
    return {
      reservation: reservationData
    }
  }

  private getStartdatetimeString (): string | null {
    if (this.startDatetime === null) {
      return null
    }
    return this.startDatetime.toISOString()
  }

  private getEnddatetimeString (): string | null {
    if (this.endDatetime === null) {
      return null
    }
    return this.endDatetime.toISOString()
  }
}
