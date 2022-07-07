import AvailabilityTimeSlotRequest from './api/availability-request'
import Booker25API from './api/booker25-api-requests'
import ServiceTimeSlotRequest from './api/service-availability-request'
import ResourceResult from './resource-result'

export default class ResourceRequest {
  private readonly api: Booker25API
  private readonly standardFields: Set<string> = new Set([
    'Id', 'Name', 'B25__Resource_Type__c', 'B25__Parent__c'
  ])

  private readonly additionalFields: Set<string> = new Set()
  private readonly parents: Set<string> = new Set()
  private startOfRange: Date | null = null
  private endOfRange: Date | null = null
  private fetchServices: boolean = false

  constructor (api: Booker25API) {
    this.api = api
  }

  public includeAllResourcesAt (parentId: string): ResourceRequest {
    this.parents.add(parentId)
    return this
  }

  public withAdditionalField (fieldName: string): ResourceRequest {
    this.additionalFields.add(fieldName)
    return this
  }

  public withAdditionalFields (fieldNames: Set<string> | string[]): ResourceRequest {
    fieldNames.forEach(fieldName => this.withAdditionalField(fieldName))
    return this
  }

  public withAvailableSlotsBetween (startOfRange: Date, endOfRange: Date): ResourceRequest {
    this.startOfRange = startOfRange
    this.endOfRange = endOfRange
    return this
  }

  public includeServices (includeServices: boolean): ResourceRequest {
    this.fetchServices = includeServices
    return this
  }

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

  private async getStartingResourceScope (): Promise<any[]> {
    if (this.parents.size === 0) {
      return await this.api.getAllResources(undefined, this.getRequestedFields())
    }
    return (await Promise.all([...this.parents].map(async (parent) => {
      return await this.api.getAllChildResources(parent, undefined, this.getRequestedFields())
    }))).flat()
  }

  private getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
