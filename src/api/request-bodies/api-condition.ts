type LogicalOperator = 'AND' | 'OR'
type APIOperator = '=' | '!=' | '>' | '<' | '<=' | '>=' | 'IN' | 'NOT IN' | 'LIKE'

type APIConditionElement = APIConditionGroup | APICondition

class APIConditionGroup {
  private readonly logicalOperator: LogicalOperator
  private readonly conditions: APIConditionElement[]
  constructor (logicalOperator: LogicalOperator, conditions: APIConditionElement[]) {
    this.logicalOperator = logicalOperator
    this.conditions = conditions
  }
}

class APICondition {
  private readonly fieldName: string
  private readonly operator: APIOperator
  private readonly values: string[]
  constructor (fieldName: string, operator: APIOperator, values: string[]) {
    this.fieldName = fieldName
    this.operator = operator
    this.values = values
  }
}

export {
  APICondition,
  APIConditionElement,
  APIConditionGroup,
  APIOperator
}
