import AvailabilityTimeSlotRequest from './api/request-bodies/availability-request'
import ServiceTimeSlotRequest from './api/request-bodies/service-availability-request'
import ResourceResult from './resource-result'
import { SFResource } from './s-objects/resource'
import { AndCondition, Condition, Operator } from './filters/conditions'
import { isSalesforceId } from './utils/salesforce-utils'
import FindAvailableIdsRequest from './findAvailableIdsRequest'
import DimensionRecordRequest from './dimension-record-request'
import GoMeddoAPI from './api/gomeddo-api-requests'

/**
 * Resource request by default will request all resources in an org.
 * Methods can be used to filter and narow down the resources being requested.
 */
export default class ResourceRequest extends DimensionRecordRequest {
  private readonly parents: Set<string> = new Set()
  private readonly types: Set<string> = new Set()
  private fetchServices: boolean = false

  constructor (api: GoMeddoAPI) {
    super(api, 'B25__Resource__c')
    this.standardFields = new Set([
      'Id', 'Name', 'B25__Resource_Type__c', 'B25__Parent__c'
    ])
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
   * Calls the GoMeddo APIs to construct the requested resources.
   *
   * @returns A ResourceResult object containing the requested resources.
   */
  public async getResults (): Promise<ResourceResult> {
    const resources = await this.getStartingResourceScope()
    const resourceResult = new ResourceResult(resources)

    if (this.reservation !== null) {
      const resourceIds = resourceResult.getResourceIds()
      const dimension = new FindAvailableIdsRequest('B25__Resource__c', resourceIds, null, this.reservation.getSFSObject())
      const availableDimensionIds = await this.api.findAvailableDimensionIds(dimension)
      resourceResult.filterResourcesById(availableDimensionIds)
    }

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
    return resourceResult.computeTreeStructure()
  }

  private async getStartingResourceScope (): Promise<SFResource[]> {
    const parentIds: string[] = []
    const parentNames: string[] = []
    for (const parent of this.parents) {
      isSalesforceId(parent) ? parentIds.push(parent) : parentNames.push(parent)
    }
    let condition: AndCondition | undefined = new AndCondition([])
    if (this.types.size !== 0) {
      condition.conditions.push(new OrCondition([...this.types].map(type => new Condition('B25__Resource_Type__r.Name', Operator.EQUAL, type))))
    }
    if (this.condition !== undefined) {
      condition.conditions.push(this.condition)
    }
    if (condition.conditions.length === 0) {
      condition = undefined
    }
    return (await this.api.searchDimensionRecords(parentIds, parentNames, condition?.getAPICondition(), this.getRequestedFields(), 'B25__Resource__c')) as unknown as SFResource[]
  }
}
