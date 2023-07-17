import { SFDimensionRecord } from '../../src/dimension-record'

class DimensionRecordGenerator {
  private readonly idPrefix: string
  private readonly namePrefix: string
  private dimensionCounter: number

  constructor (idPrefix: string, namePrefix: string) {
    this.idPrefix = idPrefix
    this.namePrefix = namePrefix
    this.dimensionCounter = 1
  }

  public getDimensioRecord (): SFDimensionRecord {
    const dimensionRecord: SFDimensionRecord = {
      Id: this.getIdString(this.dimensionCounter),
      Name: this.getNameString(this.dimensionCounter)
    }
    this.dimensionCounter++
    return dimensionRecord
  }

  public getDimensionArray (size: number): SFDimensionRecord[] {
    return new Array(size).fill(undefined).map(() => this.getDimensioRecord())
  }

  private getIdString (counter: number): string {
    return `${this.idPrefix} ${counter}`
  }

  private getNameString (counter: number): string {
    return `${this.namePrefix} ${counter}`
  }
}

export {
  DimensionRecordGenerator
}
