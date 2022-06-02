export default class ResourceType {
  public readonly id: string
  public readonly name: string

  constructor (parsedResourceType: any) {
    this.id = parsedResourceType.Id
    this.name = parsedResourceType.Name
  }
}
