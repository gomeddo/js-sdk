export default class Resource {
  public id: string
  public name: string

  constructor (parsedResource: any) {
    this.id = parsedResource.Id
    this.name = parsedResource.Name
  }
}
