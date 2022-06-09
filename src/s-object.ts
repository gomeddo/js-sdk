export default class SObject {
  public id: string
  protected readonly customProperties: Map<string, any>

  constructor (sObjectData: any = undefined, ignoredProperties: Set<string> = new Set()) {
    this.id = ''
    this.customProperties = new Map()
    if (sObjectData === undefined) {
      return
    }
    this.id = sObjectData.Id
    Object.entries(sObjectData).forEach(([fieldName, fieldValue]) => {
      if (ignoredProperties.has(fieldName)) {
        return
      }
      this.customProperties.set(fieldName, fieldValue)
    })
  }

  public setCustomProperty (propertyName: string, value: any): void {
    this.customProperties.set(propertyName, value)
  }

  public getCustomProperty (propertyName: string): any {
    return this.customProperties.get(propertyName)
  }

  public getRestData (): { [key: string]: any } {
    const sObjectData: { [key: string]: any } = {}
    this.customProperties.forEach((value, fieldName) => {
      sObjectData[fieldName] = value
    })
    return sObjectData
  }
}
