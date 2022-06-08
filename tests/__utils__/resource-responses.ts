class ResourceGenerator {
  private readonly idPrefix: string
  private readonly namePrefix: string
  private counter: number

  constructor (idPrefix: string, namePrefix: string) {
    this.idPrefix = idPrefix
    this.namePrefix = namePrefix
    this.counter = 1
  }

  public getSimpleResource (): any {
    const resource = {
      Id: `${this.idPrefix} ${this.counter}`,
      Name: `${this.namePrefix} ${this.counter}`
    }
    this.counter++
    return resource
  }

  public getSimpleResourceArray (size: number): any[] {
    return new Array(size).fill(undefined).map(() => this.getSimpleResource())
  }
}

export {
  ResourceGenerator
}
