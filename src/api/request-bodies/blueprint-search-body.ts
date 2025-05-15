import { APIConditionElement } from './api-condition'

export default class BlueprintSearchBody {
  private readonly ids: string[]
  private readonly names: string[]
  private readonly condition: APIConditionElement | undefined

  constructor (
    ids: string[],
    names: string[],
    condition: APIConditionElement | undefined
  ) {
    this.ids = ids
    this.names = names
    this.condition = condition
  }
}
