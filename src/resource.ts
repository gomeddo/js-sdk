import ResourceType from './resource-type'

export default class Resource {
  public id: string
  public name: string
  public resourceType: ResourceType

  constructor (parsedResource: any) {
    this.id = parsedResource.Id
    this.name = parsedResource.Name
    this.resourceType = new ResourceType(parsedResource.B25__Resource_Type__r)
  }
}
