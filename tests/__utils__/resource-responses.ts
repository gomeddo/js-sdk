class ResourceGenerator {
  private readonly idPrefix: string
  private readonly namePrefix: string
  private resourceCounter: number
  private resourceTypeCounter: number
  private readonly resourceTypes: Map<number, any>

  constructor (idPrefix: string, namePrefix: string) {
    this.idPrefix = idPrefix
    this.namePrefix = namePrefix
    this.resourceCounter = 1
    this.resourceTypeCounter = 1
    this.resourceTypes = new Map()
    this.addResourceType()
  }

  public addResourceType (): void {
    const resourceType = {
      Name: `Type ${this.namePrefix} ${this.resourceTypeCounter}`,
      Id: `Type ${this.idPrefix} ${this.resourceTypeCounter}`
    }
    this.resourceTypes.set(this.resourceTypeCounter, resourceType)
    this.resourceTypeCounter++
  }

  public getResourceType (type: number): any {
    return this.resourceTypes.get(type)
  }

  public getResource (): any {
    return this.getResourceOfType(1)
  }

  public getResourceArray (size: number): any[] {
    return new Array(size).fill(undefined).map(() => this.getResource())
  }

  public getResourceOfType (type: number): any {
    const resourceType = this.resourceTypes.get(type)
    const resource = {
      Id: this.idPrefix + ' ' + this.resourceCounter.toString(),
      Name: this.namePrefix + ' ' + this.resourceCounter.toString(),
      B25__Resource_Type__c: resourceType.Id,
      B25__Resource_Type__r: resourceType
    }
    this.resourceCounter++
    return resource
  }
}

export {
  ResourceGenerator
}
