import GoMeddoAPI from './api/gomeddo-api-requests'
import { AndCondition, OrCondition, ConditionElement } from './filters/conditions'
import BlueprintRecordResult from './blueprint-record-result'
import { CustomSFSObject } from './s-objects/s-object'

/**
 * Blueprint record request by default will request all records of a given blueprint.
 * Methods can be used to filter and narow down the blueprint records being requested.
 */
export default class BlueprintRecordRequest {
  protected readonly api: GoMeddoAPI
  protected standardFields: Set<string>
  protected ids: string[] = []
  protected names: string[] = []
  protected readonly additionalFields: Set<string> = new Set()
  protected condition: OrCondition | undefined

  constructor (api: GoMeddoAPI) {
    this.api = api
    this.standardFields = new Set([
      'Id', 'Name'
    ])
  }

  /**
   * Filter the blueprint records on field values using conditions.
   *
   * @param conditions The conditions to filter on. Multiple conditions wil be combined using AND.
   * @returns The updated blueprint record request.
   */
  public withCondition (...conditions: ConditionElement[]): this {
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
   * Request an additional field to be returned for the blueprint records
   *
   * @param fieldName The api name of the field to request
   * @returns The updated blueprint record request.
   */
  public includeAdditionalField (fieldName: string): this {
    this.additionalFields.add(fieldName)
    return this
  }

  /**
   * Request additional fields to be returned for the blueprint records
   *
   * @param fieldName The api names of the fields to request
   * @returns The updated blueprint record request.
   */
  public includeAdditionalFields (fieldNames: Set<string> | string[]): this {
    fieldNames.forEach(fieldName => this.includeAdditionalField(fieldName))
    return this
  }

  /**
   * Calls the GoMeddo APIs to construct the requested blueprint records.
   *
   * @returns A BlueprintRecordResult object containing the requested blueprint records.
   */
  public async getResults (): Promise<BlueprintRecordResult> {
    const blueprints = await this.getStartingBlueprintRecordScope()
    const blueprintRecordResult = new BlueprintRecordResult(blueprints)

    return blueprintRecordResult
  }

  private async getStartingBlueprintRecordScope (): Promise<CustomSFSObject[]> {
    const condition = this.condition
    return await this.api.searchBlueprintRecords(this.ids, this.names, condition?.getAPICondition(), this.getRequestedFields())
  }

  public setRequestedIds (ids: string[]): this {
    this.ids = ids
    return this
  }

  public setRequestedNames (names: string[]): this {
    this.names = names
    return this
  }

  protected getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
