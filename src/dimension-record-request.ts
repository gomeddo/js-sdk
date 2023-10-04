import AvailabilityTimeSlotRequest from './api/request-bodies/availability-request'
import GoMeddoAPI from './api/gomeddo-api-requests'
import { AndCondition, OrCondition, ConditionElement } from './filters/conditions'
import Reservation from './s-objects/reservation'
import Dimension from './dimension'
import DimensionRecordResult from './dimension-record-result'
import { CustomSFSObject } from './s-objects/s-object'

/**
 * Dimension record request by default will request all records of a given dimension.
 * Methods can be used to filter and narow down the dimension records being requested.
 */
export default class DimensionRecordRequest {
  protected readonly api: GoMeddoAPI
  protected dimensionName: string
  protected standardFields: Set<string>
  protected readonly additionalFields: Set<string> = new Set()
  protected condition: OrCondition | undefined
  protected startOfRange: Date | null = null
  protected endOfRange: Date | null = null
  protected reservation: Reservation | null = null

  constructor (api: GoMeddoAPI, dimensionName: string) {
    this.api = api
    this.standardFields = new Set([
      'Id', 'Name'
    ])
    this.dimensionName = dimensionName
  }

  /**
   * Filter the dimension records on field values using conditions.
   *
   * @param conditions The conditions to filter on. Multiple conditions wil be combined using AND.
   * @returns The updated dimension record request.
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
   * Request an additional field to be returned for the dimension records
   *
   * @param fieldName The api name of the field to request
   * @returns The updated dimension record request.
   */
  public includeAdditionalField (fieldName: string): this {
    this.additionalFields.add(fieldName)
    return this
  }

  /**
   * Request additional fields to be returned for the dimension records
   *
   * @param fieldName The api names of the fields to request
   * @returns The updated dimension record request.
   */
  public includeAdditionalFields (fieldNames: Set<string> | string[]): this {
    fieldNames.forEach(fieldName => this.includeAdditionalField(fieldName))
    return this
  }

  /**
   * Request on dimension records that are not fully booked between the two datetime.
   * The input datetimes are interpeted in GMT
   * When this is requested timeslots for the requested range are provided for each dimension record.
   *
   * @param startOfRange The start of the timeslot range
   * @param endOfRange The end of the timeslot range
   * @returns The updated dimension record request.
   */
  public withAvailableSlotsBetween (startOfRange: Date, endOfRange: Date): this {
    this.startOfRange = startOfRange
    this.endOfRange = endOfRange
    return this
  }

  /**
   * Sets the reservation for the current instance and returns the updated dimension record.
   *
   * @param reservation
   * @returns The updated dimension record
   */
  public whereICanBook (reservation: Reservation): this {
    this.reservation = reservation
    return this
  }

  /**
   * Calls the GoMeddo APIs to construct the requested dimension records.
   *
   * @returns A DimensionRecordResult object containing the requested dimension records.
   */
  public async getResults (): Promise<DimensionRecordResult> {
    const dimensions = await this.getStartingDimensionRecordScope()
    const dimensionRecordResult = new DimensionRecordResult(dimensions)

    if (this.reservation !== null) {
      const dimensionIds = dimensionRecordResult.getObjectIds()
      const dimension = new Dimension('B25__Resource__c', dimensionIds, null, this.reservation.getSFSObject())
      const availableDimensionIds = await this.api.findAvailableDimensionIds(dimension)
      dimensionRecordResult.filterDimensionRecordsById(availableDimensionIds)
    }

    if (this.startOfRange !== null && this.endOfRange !== null) {
      const availabilityData = await this.api.getAvailability(new AvailabilityTimeSlotRequest(
        this.startOfRange, this.endOfRange, dimensionRecordResult.getObjectIds()
      ))
      dimensionRecordResult.addAvailabilitySlotData(availabilityData)
    }

    return dimensionRecordResult
  }

  private async getStartingDimensionRecordScope (): Promise<CustomSFSObject[]> {
    const parentIds: string[] = []
    const parentNames: string[] = []

    const condition = this.condition
    return await this.api.searchDimensionRecords(parentIds, parentNames, condition?.getAPICondition(), this.getRequestedFields(), this.dimensionName)
  }

  protected getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
