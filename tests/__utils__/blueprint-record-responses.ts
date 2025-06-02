import { CustomSFSObject } from '../../src/s-objects/s-object'

class BlueprintRecordGenerator {
  private readonly idPrefix: string
  private readonly namePrefix: string
  private blueprintCounter: number

  constructor (idPrefix: string, namePrefix: string) {
    this.idPrefix = idPrefix
    this.namePrefix = namePrefix
    this.blueprintCounter = 1
  }

  public getBlueprintRecord (): CustomSFSObject {
    const blueprintRecord: CustomSFSObject = {
      Id: this.getIdString(this.blueprintCounter),
      Name: this.getNameString(this.blueprintCounter)
    }
    this.blueprintCounter++
    return blueprintRecord
  }

  public getBlueprintArray (size: number): CustomSFSObject[] {
    return new Array(size).fill(undefined).map(() => this.getBlueprintRecord())
  }

  private getIdString (counter: number): string {
    return `${this.idPrefix} ${counter}`
  }

  private getNameString (counter: number): string {
    return `${this.namePrefix} ${counter}`
  }
}

export {
  BlueprintRecordGenerator
}
