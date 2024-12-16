type CustomFieldName = `${string}__c`
type CustomRelationshipName = `${string}__r`
interface CustomSFSObject {
  Id: string
  Name: string
  attributes?: SObjectAttributes | undefined
  [key: CustomFieldName]: string | number | boolean | null | undefined
  [key: CustomRelationshipName]: CustomSFSObject
}

interface StandardSFSObject {
  Id: string
  attributes?: SObjectAttributes | undefined
  [key: string]: string | number | boolean | null | undefined | StandardSFSObject | CustomSFSObject | SObjectAttributes
}

interface SObjectAttributes {
  type: string
  url?: string
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

  public getCustomProperties (): Map<string, any> {
    return this.customProperties
  }

  public removeCustomProperty (propertyName: string): void {
    this.customProperties.delete(propertyName)
  }

  public getSFSObject (sObjectTypeAttr?: string): Partial<CustomSFSObject> {
    const sObjectData: Partial<CustomSFSObject> = {}
    this.customProperties.forEach((value, fieldName) => {
      // This assumption might not 100% hold but it should be ok to assume the custom property fieldname matches CustomFieldName
      // And if it does not that was done with intent and will work just fine.
      // We could restrict customProperties to CustomFieldName but that might be problematic for the Contact and Lead
      sObjectData[fieldName as CustomFieldName] = value
    })
    if (sObjectTypeAttr !== undefined) {
      // When sending this data to the salesforce API and the destination can recieve a generic sObject you need to specify this
      // Otherwise the salesforce API won't accept it.
      sObjectData.attributes = {
        type: sObjectTypeAttr
      }
    }
    return sObjectData
  }
}

const getRelationshiptNameFromFieldName = (fieldName: CustomFieldName): CustomRelationshipName => {
  return `${fieldName.substring(0, fieldName.length - 3)}__r`
}

export {
  CustomFieldName,
  CustomRelationshipName,
  CustomSFSObject,
  StandardSFSObject,
  getRelationshiptNameFromFieldName,
  SObjectAttributes
}
