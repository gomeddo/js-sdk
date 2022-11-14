import { APIConditionElement } from './api-condition'

export default class DimensionSearchBody {
  private readonly dimensionName: string
  private readonly ids: string[]
  private readonly names: string[]
  private readonly condition: APIConditionElement | undefined
  private readonly includeSubtrees: boolean

  constructor (dimensionName: string, ids: string[], names: string[], condition: APIConditionElement | undefined, includeSubtrees: boolean) {
    this.dimensionName = dimensionName
    this.ids = ids
    this.names = names
    this.condition = condition
    this.includeSubtrees = includeSubtrees
  }
}
