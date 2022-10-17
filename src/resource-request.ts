import AvailabilityTimeSlotRequest from './api/availability-request'
import Booker25API from './api/booker25-api-requests'
import ServiceTimeSlotRequest from './api/service-availability-request'
import ResourceResult from './resource-result'
import { SFResource } from './s-objects/resource'
import { AndCondition, ConditionElement, OrCondition } from './s-objects/s-object'
import { cartesianProductOf } from './utils/array-utils'

/**
 * Resource request by default will request all resources in an org.
 * Methods can be used to filter and narow down the resources being requested.
 */
export default class ResourceRequest {
  private readonly api: Booker25API
  private readonly standardFields: Set<string> = new Set([
    'Id', 'Name', 'B25__Resource_Type__c', 'B25__Parent__c'
  ])

  private readonly additionalFields: Set<string> = new Set()
  private readonly parents: Set<string> = new Set()
  private readonly types: Set<string> = new Set()
  private readonly condition: OrCondition = new OrCondition([])
  private startOfRange: Date | null = null
  private endOfRange: Date | null = null
  private fetchServices: boolean = false

  constructor (api: Booker25API) {
    this.api = api
  }

  /**
   * Set the resource request to fetch specific resource and their children.
   * Can be called multiple times and the ids will be added.
   *
   * @param parentIds The Ids of the resources you want to retrieve. Child resources will also be retrieved.
   * @returns The updated resource request.
   */
  public includeAllResourcesAt (...parentIds: string[]): ResourceRequest {
    parentIds.forEach(parentid => this.parents.add(parentid))
    return this
  }

  /**
   * Filter the resources to only include resources of the specific type or types
   *
   * @param typeIds the ids of the resource types to include.
   * @returns The updated resource request.
   */
  public withType (...typeIds: string[]): ResourceRequest {
    typeIds.forEach(typeId => this.types.add(typeId))
    return this
  }

  /**
   * Filter the resources on field values using conditions.
   *
   * @param conditions The conditions to filter on. Multiple conditions wil be combined using AND.
   * @returns The updated resource request.
   */
  public withCondition (...conditions: ConditionElement[]): ResourceRequest {
    this.condition.conditions.push(new AndCondition(conditions))
    return this
  }

  /**
   * Request an additional field to be returned for the resources
   *
   * @param fieldName The api name of the field to request
   * @returns The updated resource request.
   */
  public withAdditionalField (fieldName: string): ResourceRequest {
    this.additionalFields.add(fieldName)
    return this
  }

  /**
   * Request additional fields to be returned for the resources
   *
   * @param fieldName The api names of the fields to request
   * @returns The updated resource request.
   */
  public withAdditionalFields (fieldNames: Set<string> | string[]): ResourceRequest {
    fieldNames.forEach(fieldName => this.withAdditionalField(fieldName))
    return this
  }

  /**
   * Request on resources that are not fully booked between the two datetime.
   * The input datetimes are interpeted in GMT
   * When this is requested timeslots for the requested range are provided for each resource.
   *
   * @param startOfRange The start of the timeslot range
   * @param endOfRange The end of the timeslot range
   * @returns The updated resource request.
   */
  public withAvailableSlotsBetween (startOfRange: Date, endOfRange: Date): ResourceRequest {
    this.startOfRange = startOfRange
    this.endOfRange = endOfRange
    return this
  }

  /**
   * Also fetch the services including slot for when the services are available
   * Only valid if withAvailableSlotsBetween has also been called.
   *
   * @param includeServices Whether to include the services or not
   * @returns The updated resource request.
   */
  public includeServices (includeServices: boolean): ResourceRequest {
    this.fetchServices = includeServices
    return this
  }

  /**
   * Calls the booker25 APIs to construct the requested resources.
   *
   * @returns A ResourceResult object containing the requested resources.
   */
  public async getResults (): Promise<ResourceResult> {
    const resources = await this.getStartingResourceScope()
    const resourceResult = new ResourceResult(resources)
    if (this.startOfRange !== null && this.endOfRange !== null) {
      const availabilityData = await this.api.getAvailability(new AvailabilityTimeSlotRequest(
        this.startOfRange, this.endOfRange, resourceResult.getResourceIds()
      ))
      resourceResult.addAvailabilitySlotData(availabilityData)
    }
    if (this.startOfRange !== null && this.endOfRange !== null && this.fetchServices) {
      const serviceData = await this.api.getServiceAvailability(new ServiceTimeSlotRequest(
        this.startOfRange, this.endOfRange, resourceResult.getResourceIds()
      ))
      resourceResult.addServiceSlotData(serviceData)
    }
    resourceResult.filterOnCondition(this.condition)
    return resourceResult.computeTreeStructure()
  }

  private async getStartingResourceScope (): Promise<SFResource[]> {
    if (this.parents.size === 0 && this.types.size === 0) {
      return await this.api.getAllResources(undefined, this.getRequestedFields())
    }
    if (this.parents.size === 0) {
      return (await Promise.all([...this.types].map(async (type) => {
        return await this.api.getAllResources(type, this.getRequestedFields())
      }))).flat()
    }
    if (this.types.size === 0) {
      return (await Promise.all([...this.parents].map(async (parent) => {
        return await this.api.getAllChildResources(parent, undefined, this.getRequestedFields())
      }))).flat()
    }
    return (await Promise.all(cartesianProductOf([...this.parents], [...this.types]).map(async ([parent, type]) => {
      return await this.api.getAllChildResources(parent, type, this.getRequestedFields())
    }))).flat()
  }

  private getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields, ...this.condition.getFields()])
  }
}
