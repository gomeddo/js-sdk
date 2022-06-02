import ResourceType from './resource-type'

const standardProperies: Set<string> = new Set(['Id', 'Name', 'B25__Resource_Type__r', 'B25__Resource_Type__c'])

export default class Resource {
  public id: string
  public name: string
  public resourceType: ResourceType
  public customProperties: Map<string, any>

  constructor (parsedResource: any) {
    this.id = parsedResource.Id
    this.name = parsedResource.Name
    this.resourceType = new ResourceType(parsedResource.B25__Resource_Type__r)
    this.customProperties = new Map()
    Object.entries(parsedResource).forEach(([fieldName, fieldValue]) => {
      if (standardProperies.has(fieldName)) {
        return
      }
      this.customProperties.set(fieldName, fieldValue)
    })
  }

  public getCustomProperty (propertyName: string): any {
    return this.customProperties.get(propertyName)
  }
}
