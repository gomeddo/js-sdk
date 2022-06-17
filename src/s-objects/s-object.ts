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

enum Operator {
  EQUAL,
  NOT_EQUAL,
  LESS_THAN,
  GREATER_THAN
}

class Condition {
  field: string
  opperator: Operator
  value: any
  constructor (field: string, opperator: Operator, value: any) {
    this.field = field
    this.opperator = opperator
    this.value = value
  }

  matches (resource: SObject): boolean {
    const value = resource.getCustomProperty(this.field)
    if (this.opperator === Operator.EQUAL) {
      return value === this.value
    }
    if (this.opperator === Operator.LESS_THAN) {
      return value < this.value
    }
    if (this.opperator === Operator.GREATER_THAN) {
      return value > this.value
    }
    return value !== this.value
  }
}

export {
  Condition,
  Operator
}
