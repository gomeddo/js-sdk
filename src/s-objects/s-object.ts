
type CustomFieldName = `${string}__c`
type CustomRelationshipName = `${string}__r`
interface CustomSFSObject {
  Id: string
  Name: string
  [key: CustomFieldName]: string | number | boolean | null | undefined
  [key: CustomRelationshipName]: CustomSFSObject
}

interface StandardSFSObject {
  Id: string
  [key: string]: string | number | boolean | null | undefined | StandardSFSObject | CustomSFSObject
}

export default class SObject {
  public id: string
  protected readonly customProperties: Map<string, any>

  constructor (sObjectData: CustomSFSObject | undefined = undefined, ignoredProperties: Set<string> = new Set()) {
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

  public getSFSObject (): Partial<CustomSFSObject> {
    const sObjectData: Partial<CustomSFSObject> = {}
    this.customProperties.forEach((value, fieldName) => {
      // This assumption might not 100% hold but it should be ok to assume the custom property fieldname matches CustomFieldName
      // And if it does not that was done with intent and will work just fine.
      // We could restrict customProperties to CustomFieldName but that might be problematic for the Contact and Lead
      sObjectData[fieldName as CustomFieldName] = value
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

interface ConditionElement {
  matches: (resource: SObject) => boolean
}

class AndCondition implements ConditionElement {
  conditions: ConditionElement[] = []

  constructor (conditions: ConditionElement[]) {
    this.conditions = conditions
  }

  matches (resource: SObject): boolean {
    return this.conditions.every(condition => condition.matches(resource))
  }
}

class OrCondition implements ConditionElement {
  conditions: ConditionElement[] = []

  constructor (conditions: ConditionElement[]) {
    this.conditions = conditions
  }

  matches (resource: SObject): boolean {
    if (this.conditions.length === 0) {
      return true
    }
    return this.conditions.some(condition => condition.matches(resource))
  }
}

class Condition implements ConditionElement {
  field: string
  operator: Operator
  value: string | number | boolean
  constructor (field: string, operator: Operator, value: string | number | boolean) {
    this.field = field
    this.operator = operator
    this.value = value
  }

  matches (resource: SObject): boolean {
    const value = resource.getCustomProperty(this.field)
    if (this.operator === Operator.EQUAL) {
      return value === this.value
    }
    if (this.operator === Operator.LESS_THAN) {
      return value < this.value
    }
    if (this.operator === Operator.GREATER_THAN) {
      return value > this.value
    }
    return value !== this.value
  }
}

export {
  Condition,
  ConditionElement,
  AndCondition,
  OrCondition,
  Operator,
  CustomSFSObject,
  StandardSFSObject
}
