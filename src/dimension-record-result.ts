import AvailabilityTimeSlotResponse from './api/availability-reponse'
import DimensionRecord from './dimension-record'
import { CustomSFSObject } from './s-objects/s-object'
import { isSalesforceId } from './utils/salesforce-utils'

/**
 * Result object of a dimension record request. Contains methods to extract dimension records.
 */
export default class DimensionRecordResult {
  private readonly objectById: Map<string, DimensionRecord>

  constructor (sfObjectData: CustomSFSObject[]) {
    // Map all dimension records to their ids
    this.objectById = sfObjectData.reduce((map, sfObjectData) => {
      const dimensionRecord = new DimensionRecord(sfObjectData)
      map.set(dimensionRecord.id, dimensionRecord)
      return map
    }, new Map())
  }

  public addAvailabilitySlotData (dimensionsSlotData: AvailabilityTimeSlotResponse[]): void {
    dimensionsSlotData.forEach((slotData) => {
      const matchingDimension = this.objectById.get(slotData.dimensionId)
      if (matchingDimension === undefined) {
        return
      }
      matchingDimension.addAvailabilitySlotData(slotData)
      if (matchingDimension.isClosed()) {
        this.objectById.delete(slotData.dimensionId)
      }
    })
  }

  /**
   * @returns the number of dimension records matching the request
   */
  public numberOfDimensionRecords (): number {
    return this.objectById.size
  }

  /**
   * @returns a list of all the dimension record ids matching the requests
   */
  public getObjectIds (): string[] {
    return [...this.objectById.keys()]
  }

  /**
   * @param idOrName the Id or the Name of the dimension record to retrieve.
   * @returns The matching dimension record. Or undefined if not found.
   */
  public getDimensionRecord (idOrName: string): DimensionRecord | undefined {
    if (isSalesforceId(idOrName)) {
      return this.objectById.get(idOrName)
    }
    return [...this.objectById.values()].find(dimensionRecord => dimensionRecord.name === idOrName)
  }

  /**
   * Filters the dimension records in the `objectById` map based on the allowed ids.
   * @param dimensionRecordIds The ids of the dimension records that are allowed to remain in the map.
   * @returns void
   */
  public filterDimensionRecordsById (dimensionRecordIds: string[]): void {
    this.objectById.forEach((dimensionRecord, id) => {
      if (!dimensionRecordIds.includes(id)) {
        this.objectById.delete(id)
      }
    })
  }
}
