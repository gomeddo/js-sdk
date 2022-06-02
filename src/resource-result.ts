import Resource from './resource'

export default class ResourceResult {
  private readonly resources: Resource[]

  constructor (parsedResources: any[]) {
    this.resources = parsedResources.map(parsedResource => new Resource(parsedResource))
  }

  public numberOfresources (): number {
    return this.resources.length
  }

  public getResourceById (id: string): Resource | undefined {
    return this.resources.find(resource => resource.id === id)
  }

  public getResourceByName (name: string): Resource | undefined {
    return this.resources.find(resource => resource.name === name)
  }
}
