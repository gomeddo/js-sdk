import SObject, { CustomSFSObject } from './s-objects/s-object'

/**
 * A BlueprintRecord
 */
export default class BlueprintRecord extends SObject {
  public name: string

  constructor (parsedBlueprintRecord: CustomSFSObject) {
    super(parsedBlueprintRecord)
    this.name = parsedBlueprintRecord.Name
  }
}
