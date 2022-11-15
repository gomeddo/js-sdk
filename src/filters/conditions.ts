import { APICondition, APIConditionElement, APIConditionGroup, APIOperator } from '../api/request-bodies/api-condition'

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

class Condition implements ConditionElement {
  field: string
  operator: Operator
  value: string | number | boolean | string[]
  constructor (field: string, operator: Operator, value: string | number | boolean | string[]) {
    this.field = field
    this.operator = operator
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

  private isListType (): boolean {
    return this.operator === Operator.IN || this.operator === Operator.NOT_IN
  }

  private translateOperator (operator: Operator): APIOperator {
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

export {
  Condition,
  ConditionElement,
  AndCondition,
  OrCondition,
  Operator
}
