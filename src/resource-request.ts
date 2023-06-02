import AvailabilityTimeSlotRequest from './api/request-bodies/availability-request'
import GoMeddoAPI from './api/gomeddo-api-requests'
import ServiceTimeSlotRequest from './api/request-bodies/service-availability-request'
import ResourceResult from './resource-result'
import { SFResource } from './s-objects/resource'
import { AndCondition, OrCondition, ConditionElement, Condition, Operator } from './filters/conditions'
import { isSalesforceId } from './utils/salesforce-utils'

/**
 * Resource request by default will request all resources in an org.
 * Methods can be used to filter and narow down the resources being requested.
 */
export default class ResourceRequest {
  private readonly api: GoMeddoAPI
  private readonly standardFields: Set<string> = new Set([
    'Id', 'Name', 'B25__Resource_Type__c', 'B25__Parent__c'
  ])

  private readonly additionalFields: Set<string> = new Set()
  private readonly parents: Set<string> = new Set()
  private readonly types: Set<string> = new Set()
  private condition: OrCondition | undefined
  private startOfRange: Date | null = null
  private endOfRange: Date | null = null
  private fetchServices: boolean = false

  constructor (api: GoMeddoAPI) {
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
    if (this.condition === undefined) {
      this.condition = new OrCondition([])
    }
    if (conditions.length === 1) {
      this.condition.conditions.push(conditions[0])
    } else {
      this.condition.conditions.push(new AndCondition(conditions))
    }
    return this
  }

  /**
   * Request an additional field to be returned for the resources
   *
   * @param fieldName The api name of the field to request
   * @returns The updated resource request.
   */
  public includeAdditionalField (fieldName: string): ResourceRequest {
    this.additionalFields.add(fieldName)
    return this
  }

  /**
   * Request additional fields to be returned for the resources
   *
   * @param fieldName The api names of the fields to request
   * @returns The updated resource request.
   */
  public includeAdditionalFields (fieldNames: Set<string> | string[]): ResourceRequest {
    fieldNames.forEach(fieldName => this.includeAdditionalField(fieldName))
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
   * Calls the GoMeddo APIs to construct the requested resources.
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
    if(condition.conditions.length === 0){
      condition = undefined
    }
    return await this.api.searchResources(parentIds, parentNames, condition?.getAPICondition(), this.getRequestedFields())
  }

  private getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
