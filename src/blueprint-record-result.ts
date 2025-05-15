import BlueprintRecord from './blueprint-record'
import { CustomSFSObject } from './s-objects/s-object'
import { isSalesforceId } from './utils/salesforce-utils'

/**
 * Result object of a blueprint record request. Contains methods to extract blueprint records.
 */
export default class BlueprintRecordResult {
  private readonly objectById: Map<string, BlueprintRecord>

  constructor (sfObjectData: CustomSFSObject[]) {
    // Map all blueprint records to their ids
    this.objectById = sfObjectData.reduce((map, sfObjectData) => {
      const blueprintRecord = new BlueprintRecord(sfObjectData)
      map.set(blueprintRecord.id, blueprintRecord)
      return map
    }, new Map())
  }

  /**
   * @returns the number of blueprint records matching the request
   */
  public numberOfBlueprintRecords (): number {
    return this.objectById.size
  }

  /**
   * @returns a list of all the blueprint record ids matching the requests
   */
  public getObjectIds (): string[] {
    return [...this.objectById.keys()]
  }

  /**
   * @param idOrName the Id or the Name of the blueprint record to retrieve.
   * @returns The matching blueprint record. Or undefined if not found.
   */
  public getBlueprintRecord (idOrName: string): BlueprintRecord | undefined {
    if (isSalesforceId(idOrName)) {
      return this.objectById.get(idOrName)
    }
    return [...this.objectById.values()].find(blueprintRecord => blueprintRecord.name === idOrName)
  }

  /**
   * Filters the blueprint records in the `objectById` map based on the allowed ids.
   * @param blueprintRecordIds The ids of the blueprint records that are allowed to remain in the map.
   * @returns void
   */
  public filterBlueprintRecordsById (blueprintRecordIds: string[]): void {
    this.objectById.forEach((blueprintRecord, id) => {
      if (!blueprintRecordIds.includes(id)) {
        this.objectById.delete(id)
      }
    })
  }
}
