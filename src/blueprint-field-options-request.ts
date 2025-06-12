import GoMeddoAPI from './api/gomeddo-api-requests'
import BlueprintFieldOptionsResult from './blueprint-field-options-result'
import { SFReservation } from './s-objects/reservation'
import { CustomSFSObject } from './s-objects/s-object'

export default class BlueprintFieldOptionsRequest {
  protected readonly api: GoMeddoAPI
  protected readonly blueprintIdentifier: string
  protected readonly fieldIdentifier: string
  protected standardFields: Set<string>
  protected readonly additionalFields: Set<string> = new Set()
  protected prototype: SFReservation

  constructor (api: GoMeddoAPI, blueprintIdentifier: string, fieldIdentifier: string) {
    this.api = api
    this.blueprintIdentifier = blueprintIdentifier
    this.fieldIdentifier = fieldIdentifier
    this.standardFields = new Set([
      'Id', 'Name'
    ])
    this.prototype = { Id: '', Name: '' }
  }

  /**
   * Request an additional field to be returned for the records
   *
   * @param fieldName The api name of the field to request
   * @returns The updated blueprint field options request.
   */
  public includeAdditionalField (fieldName: string): this {
    this.additionalFields.add(fieldName)
    return this
  }

  /**
   * Request additional fields to be returned for the records
   *
   * @param fieldName The api names of the fields to request
   * @returns The updated blueprint field options request.
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
    const blueprintRecordResult = new BlueprintFieldOptionsResult(sObjectOptions)
    return blueprintRecordResult
  }

  private async getStartingBlueprintRecordScope (): Promise<CustomSFSObject[]> {
    return await this.api.getBlueprintFieldOptions(this.blueprintIdentifier, this.fieldIdentifier, this.prototype, this.getRequestedFields())
  }

  public setFieldOnPrototype<T extends keyof SFReservation> (fieldName: T, fieldValue: SFReservation[T]): this {
    this.prototype[fieldName] = fieldValue
    return this
  }

  protected getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
