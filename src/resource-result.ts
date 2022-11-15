import AvailabilityTimeSlotResponse from './api/availability-reponse'
import ServiceTimeSlotResponse from './api/service-availability-response'
import Resource, { SFResource } from './s-objects/resource'
import { isSalesforceId } from './utils/salesforce-utils'

/**
 * Result object of a resource request. Contains methods to extract resources.
 */
export default class ResourceResult {
  private readonly resourcesById: Map<string, Resource>

  constructor (sfResourceData: SFResource[]) {
    // Map all resources to their ids
    this.resourcesById = sfResourceData.reduce((map, sfResourceData) => {
      const resource = new Resource(sfResourceData)
      map.set(resource.id, resource)
      return map
    }, new Map())
  }

  public computeTreeStructure (): ResourceResult {
    // Go through all of the resources and set the parent and children fields
    this.resourcesById.forEach((resource, id, map) => {
      if (resource.parentId === null) {
        return
      }
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

  public addServiceSlotData (dimensionsServiceSlotData: ServiceTimeSlotResponse[]): void {
    dimensionsServiceSlotData.forEach((slotData) => {
      const matchingResource = this.resourcesById.get(slotData.dimensionId)
      if (matchingResource === undefined) {
        return
      }
      matchingResource.addServiceData(slotData)
    })
  }

  /**
   * @returns the number of resources matching the request
   */
  public numberOfresources (): number {
    return this.resourcesById.size
  }

  /**
   * @returns a list of all the resource ids matching the requests
   */
  public getResourceIds (): string[] {
    return [...this.resourcesById.keys()]
  }

  /**
   * @param idOrName the Id or the Name of the resource to retrieve.
   * @returns The matching resource. Or undefined if not found.
   */
  public getResource (idOrName: string): Resource | undefined {
    if (isSalesforceId(idOrName)) {
      return this.resourcesById.get(idOrName)
    }
    return [...this.resourcesById.values()].find(resource => resource.name === idOrName)
  }
}
