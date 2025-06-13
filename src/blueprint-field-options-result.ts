import SObject, { CustomSFSObject } from './s-objects/s-object'

/**
 * Result object of a blueprint field options request. Contains methods to extract the resulting records.
 */
export default class BlueprintFieldOptionsResult {
  private readonly objectById: Map<string, SObject>

  constructor (sfObjectData: CustomSFSObject[]) {
    // Map all records to their ids
    this.objectById = sfObjectData.reduce((map, sfObjectData) => {
      const record = new SObject(sfObjectData)
      map.set(record.id, record)
      return map
    }, new Map())
  }

  /**
   * @returns the number of records matching the request
   */
  public numberOfOptions (): number {
    return this.objectById.size
  }

  /**
   * @returns a list of all the record ids matching the requests
   */
  public getObjectIds (): string[] {
    return [...this.objectById.keys()]
  }

  /**
   * @param idOrName the Id or the Name of the record to retrieve.
   * @returns The matching record. Or undefined if not found.
   */
  public getRecord (id: string): SObject | undefined {
    return this.objectById.get(id)
  }
}
