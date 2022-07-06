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
      Name: this.getTypeNameString(this.resourceTypeCounter),
      Id: this.getTypeIdString(this.resourceTypeCounter)
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

  public getResourceWithParent (parent: number): any {
    const resourceWithType = this.getResourceOfType(1)
    resourceWithType.B25__Parent__c = this.getIdString(parent)
    return resourceWithType
  }

  public getResourceOfType (type: number): any {
    const resourceType = this.resourceTypes.get(type)
    const resource = {
      Id: this.getIdString(this.resourceCounter),
      Name: this.getNameString(this.resourceCounter),
      B25__Resource_Type__c: resourceType.Id,
      B25__Resource_Type__r: resourceType
    }
    this.resourceCounter++
    return resource
  }

  private getIdString (counter: number): string {
    return `${this.idPrefix} ${counter}`
  }

  private getNameString (counter: number): string {
    return `${this.namePrefix} ${counter}`
  }

  private getTypeIdString (counter: number): string {
    return `Type ${this.getIdString(counter)}`
  }

  private getTypeNameString (counter: number): string {
    return `Type ${this.getNameString(counter)}`
  }
}

export {
  ResourceGenerator
}
