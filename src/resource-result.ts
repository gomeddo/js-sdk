import AvailabilityTimeSlotResponse from './api/availability-reponse'
import Resource from './resource'

export default class ResourceResult {
  private readonly resourcesById: Map<string, Resource>

  constructor (parsedResources: any[]) {
    // Map all resources to their ids
    this.resourcesById = parsedResources.reduce((map, parsedResource) => {
      const resource = new Resource(parsedResource)
      map.set(resource.id, resource)
      return map
    }, new Map())
  }

  public computeTreeStructure (): ResourceResult {
    // Go through all of the resources and set the parent and children fields
    this.resourcesById.forEach((resource, id, map) => {
      const parentResource = map.get(resource.parentId)
      if (parentResource === undefined) {
        return
      }
      resource.parent = parentResource
      parentResource.children.push(resource)
    })
    return this
  }

  public addAvailabilitySlotData (dimensionsSlotData: AvailabilityTimeSlotResponse[]): void {
    dimensionsSlotData.forEach((slotData) => {
      const matchingResource = this.resourcesById.get(slotData.dimensionId)
      if (matchingResource === undefined) {
        return
      }
      matchingResource.addAvailabilitySlotData(slotData)
      if (matchingResource.isClosed()) {
        this.resourcesById.delete(slotData.dimensionId)
      }
    })
  }

  public numberOfresources (): number {
    return this.resourcesById.size
  }

  public getResourceIds (): string[] {
    return [...this.resourcesById.keys()]
  }

  public getResourceById (id: string): Resource | undefined {
    return this.resourcesById.get(id)
  }

  public getResourceByName (name: string): Resource | undefined {
    return [...this.resourcesById.values()].find(resource => resource.name === name)
  }
}
