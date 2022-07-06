import ResourceType from './resource-type'
import SObject from './s-object'

export default class Resource extends SObject {
  public name: string
  public resourceType: ResourceType
  public parentId: string
  public parent: Resource | null = null
  public children: Resource[] = []

  constructor (parsedResource: any) {
    super(parsedResource, new Set(['Id', 'Name', 'B25__Resource_Type__r', 'B25__Resource_Type__c', 'B25__Parent__c']))
    this.name = parsedResource.Name
    this.parentId = parsedResource.B25__Parent__c
    this.resourceType = new ResourceType(parsedResource.B25__Resource_Type__r)
  }
}
