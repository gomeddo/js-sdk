import SObject from './s-object'

export default class ResourceType extends SObject {
  public readonly name: string

  constructor (parsedResourceType: any) {
    super(parsedResourceType)
    this.name = parsedResourceType.Name
  }
}
