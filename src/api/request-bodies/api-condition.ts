type LogicalOperator = 'AND' | 'OR'
type APIOperator = '=' | '!=' | '>' | '<' | '<=' | '>=' | 'IN' | 'NOT IN' | 'LIKE'

type APIConditionElement = APIConditionGroup | BaseApiCondition

class APIConditionGroup {
  private readonly logicalOperator: LogicalOperator
  private readonly conditions: APIConditionElement[]
  constructor (logicalOperator: LogicalOperator, conditions: APIConditionElement[]) {
    this.logicalOperator = logicalOperator
    this.conditions = conditions
  }
}

class BaseApiCondition {
  private readonly fieldName: string
  private readonly operator: APIOperator
  constructor (fieldName: string, operator: APIOperator) {
    this.fieldName = fieldName
    this.operator = operator
  }
}
class APICondition extends BaseApiCondition {
  private readonly values: string[]
  constructor (fieldName: string, operator: APIOperator, values: string[]) {
    super(fieldName, operator)
    this.values = values
  }
}

class APIJoinCondition extends BaseApiCondition {
  private readonly joinQuery: JoinQuery | undefined
  constructor (fieldName: string, operator: APIOperator, joinQuery: JoinQuery | undefined) {
    super(fieldName, operator)
    this.joinQuery = joinQuery
  }
}

class JoinQuery {
  private readonly sObjectType: string
  private readonly referenceField: string
  private readonly condition: APIConditionElement | undefined

  constructor (sObjectType: string, referenceField: string, condition: APIConditionElement | undefined) {
    this.sObjectType = sObjectType
    this.referenceField = referenceField
    this.condition = condition
  }
}

export {
  APICondition,
  APIConditionElement,
  APIConditionGroup,
  APIOperator,
  APIJoinCondition,
  JoinQuery
}
