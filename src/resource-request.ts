import Booker25API from './booker25-api-requests'
import ResourceResult from './resource-result'

export default class ResourceRequest {
  private readonly api: Booker25API
  private readonly standardFields: Set<string> = new Set([
    'Id', 'Name', 'B25__Resource_Type__c', 'B25__Parent__c'
  ])

  private readonly additionalFields: Set<string> = new Set()

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

  public async getResults (): Promise<ResourceResult> {
    const results = await this.api.getAllResources(undefined, this.getRequestedFields())
    return new ResourceResult(results)
  }

  private getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
