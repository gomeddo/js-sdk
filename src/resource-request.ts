import AvailabilityTimeSlotRequest from './api/availability-request'
import Booker25API from './api/booker25-api-requests'
import ResourceResult from './resource-result'

export default class ResourceRequest {
  private readonly api: Booker25API
  private readonly standardFields: Set<string> = new Set([
    'Id', 'Name', 'B25__Resource_Type__c', 'B25__Parent__c'
  ])

  private readonly additionalFields: Set<string> = new Set()
  private startOfRange: Date | null = null
  private endOfRange: Date | null = null

  constructor (api: Booker25API) {
    this.api = api
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

  public async getResults (): Promise<ResourceResult> {
    const resources = await this.api.getAllResources(undefined, this.getRequestedFields())
    const resourceResult = new ResourceResult(resources)
    if (this.startOfRange !== null && this.endOfRange !== null) {
      const availabilityData = await this.api.getAvailability(new AvailabilityTimeSlotRequest(
        this.startOfRange, this.endOfRange, resourceResult.getResourceIds()
      ))
      resourceResult.addAvailabilitySlotData(availabilityData)
    }
    return resourceResult.computeTreeStructure()
  }

  private getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
