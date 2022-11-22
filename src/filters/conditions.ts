import { APICondition, APIConditionElement, APIConditionGroup, APIJoinCondition, APIOperator, JoinQuery } from '../api/request-bodies/api-condition'

enum Operator {
  EQUAL,
  NOT_EQUAL,
  LESS_THAN,
  GREATER_THAN,
  IN,
  NOT_IN
}

interface ConditionElement {
  getAPICondition: () => APIConditionElement
}

class AndCondition implements ConditionElement {
  public conditions: ConditionElement[] = []

  constructor (conditions: ConditionElement[]) {
    this.conditions = conditions
  }

  public getAPICondition (): APIConditionGroup {
    const apiCondition = new APIConditionGroup('AND', this.conditions.map(condition => condition.getAPICondition()))
    return apiCondition
  }
}

class OrCondition implements ConditionElement {
  public conditions: ConditionElement[] = []

  constructor (conditions: ConditionElement[]) {
    this.conditions = conditions
  }

  public getAPICondition (): APIConditionGroup {
    const apiCondition = new APIConditionGroup('OR', this.conditions.map(condition => condition.getAPICondition()))
    return apiCondition
  }
}

class BaseCondition {
  field: string
  operator: Operator
  constructor (field: string, operator: Operator) {
    this.field = field
    this.operator = operator
  }

  protected isListType (): boolean {
    return this.operator === Operator.IN || this.operator === Operator.NOT_IN
  }

  protected translateOperator (operator: Operator): APIOperator {
    switch (operator) {
      case Operator.EQUAL:
        return '='
      case Operator.GREATER_THAN:
        return '>'
      case Operator.LESS_THAN:
        return '<'
      case Operator.NOT_EQUAL:
        return '!='
      case Operator.IN:
        return 'IN'
      case Operator.NOT_IN:
        return 'NOT IN'
    }
  }
}

class Condition extends BaseCondition implements ConditionElement {
  value: string | number | boolean | string[]
  constructor (field: string, operator: Operator, value: string | number | boolean | string[]) {
    super(field, operator)
    this.value = value
  }

  public getAPICondition (): APICondition {
    if (!this.isListType()) {
      return new APICondition(this.field, this.translateOperator(this.operator), [this.value.toString()])
    }
    if (!Array.isArray(this.value)) {
      throw new Error('IN and NOT IN are only allowed to be used with the string[] type')
    }
    return new APICondition(this.field, this.translateOperator(this.operator), this.value)
  }
}

class JoinCondition extends BaseCondition implements ConditionElement {
  sObjectType: string
  referenceField: string
  condition: ConditionElement | undefined

  constructor (field: string, operator: Operator, sObjectType: string, referenceField: string, condition: ConditionElement | undefined) {
    super(field, operator)
    this.sObjectType = sObjectType
    this.referenceField = referenceField
    this.condition = condition
  }

  public getAPICondition (): APIJoinCondition {
    if (!this.isListType()) {
      throw new Error('Join Conditions have to be IN or NOT IN')
    }
    return new APIJoinCondition(
      this.field, this.translateOperator(this.operator), new JoinQuery(
        this.sObjectType, this.referenceField, this.condition?.getAPICondition()
      )
    )
  }
}

export {
  Condition,
  JoinCondition,
  ConditionElement,
  AndCondition,
  OrCondition,
  Operator
}
