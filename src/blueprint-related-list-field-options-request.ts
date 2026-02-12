import GoMeddoAPI from './api/gomeddo-api-requests'
import BlueprintFieldOptionsResult from './blueprint-field-options-result'
import { SFReservation } from './s-objects/reservation'
import { CustomSFSObject } from './s-objects/s-object'

export default class BlueprintRelatedListFieldOptionsRequest {
  protected readonly api: GoMeddoAPI
  protected readonly blueprintIdentifier: string
  protected readonly relatedListIdentifier: string
  protected readonly fieldIdentifier: string
  protected standardFields: Set<string>
  protected readonly additionalFields: Set<string> = new Set()
  protected prototype: Partial<SFReservation>

  constructor (api: GoMeddoAPI, blueprintIdentifier: string, relatedListIdentifier: string, fieldIdentifier: string) {
    this.api = api
    this.blueprintIdentifier = blueprintIdentifier
    this.relatedListIdentifier = relatedListIdentifier
    this.fieldIdentifier = fieldIdentifier
    this.standardFields = new Set([
      'Id', 'Name'
    ])
    this.prototype = {}
  }

  /**
   * Request an additional field to be returned for the records
   *
   * @param fieldName The api name of the field to request
   * @returns The updated blueprint related list field options request.
   */
  public includeAdditionalField (fieldName: string): this {
    this.additionalFields.add(fieldName)
    return this
  }

  /**
   * Request additional fields to be returned for the records
   *
   * @param fieldNames The api names of the fields to request
   * @returns The updated blueprint related list field options request.
   */
  public includeAdditionalFields (fieldNames: Set<string> | string[]): this {
    fieldNames.forEach(fieldName => this.includeAdditionalField(fieldName))
    return this
  }

  /**
   * Calls the GoMeddo APIs to get the requested field options.
   *
   * @returns A BlueprintFieldOptionsResult object containing the requested blueprint records.
   */
  public async getResults (): Promise<BlueprintFieldOptionsResult> {
    const sObjectOptions = await this.getStartingBlueprintRecordScope()
    return new BlueprintFieldOptionsResult(sObjectOptions)
  }

  private async getStartingBlueprintRecordScope (): Promise<CustomSFSObject[]> {
    return await this.api.getBlueprintRelatedListFieldOptions(this.blueprintIdentifier, this.relatedListIdentifier, this.fieldIdentifier, this.prototype, this.getRequestedFields())
  }

  public setPrototype (prototype: Partial<SFReservation>): this {
    this.prototype = prototype
    return this
  }

  public setFieldOnPrototype<T extends keyof SFReservation> (fieldName: T, fieldValue: SFReservation[T]): this {
    this.prototype[fieldName] = fieldValue
    return this
  }

  protected getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
