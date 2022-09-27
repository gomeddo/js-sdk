import { SFResource } from '../../src/s-objects/resource'
import { SFResourceType } from '../../src/s-objects/resource-type'

class ResourceGenerator {
  private readonly idPrefix: string
  private readonly namePrefix: string
  private resourceCounter: number
  private resourceTypeCounter: number
  private readonly resourceTypes: Map<number, SFResourceType>

  constructor (idPrefix: string, namePrefix: string) {
    this.idPrefix = idPrefix
    this.namePrefix = namePrefix
    this.resourceCounter = 1
    this.resourceTypeCounter = 1
    this.resourceTypes = new Map()
    this.addResourceType()
  }

  public addResourceType (): void {
    const resourceType: SFResourceType = {
      Id: this.getTypeIdString(this.resourceTypeCounter),
      Name: this.getTypeNameString(this.resourceTypeCounter)
    }
    this.resourceTypes.set(this.resourceTypeCounter, resourceType)
    this.resourceTypeCounter++
  }

  public getResourceType (type: number): SFResourceType {
    const resourceType = this.resourceTypes.get(type)
    if (resourceType === undefined) {
      throw new Error('Resource type not yet created')
    }
    return resourceType
  }

  public getResource (): SFResource {
    return this.getResourceOfType(1)
  }

  public getResourceArray (size: number): SFResource[] {
    return new Array(size).fill(undefined).map(() => this.getResource())
  }

  public getResourceWithParent (parent: number): SFResource {
    const resourceWithType = this.getResourceOfType(1)
    resourceWithType.B25__Parent__c = this.getIdString(parent)
    return resourceWithType
  }

  public getResourceOfType (type: number): SFResource {
    const resourceType = this.getResourceType(type)
    const resource: SFResource = {
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
