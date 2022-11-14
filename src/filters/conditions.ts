import { APICondition, APIConditionElement, APIConditionGroup, APIOperator } from '../api/api-condition'

enum Operator {
  EQUAL,
  NOT_EQUAL,
  LESS_THAN,
  GREATER_THAN
}

interface ConditionElement {
  getAPICondition: () => APIConditionElement
}

class AndCondition implements ConditionElement {
  conditions: ConditionElement[] = []

  constructor (conditions: ConditionElement[]) {
    this.conditions = conditions
  }

  getAPICondition (): APIConditionGroup {
    const apiCondition = new APIConditionGroup('AND', this.conditions.map(condition => condition.getAPICondition()))
    return apiCondition
  }
}

class OrCondition implements ConditionElement {
  conditions: ConditionElement[] = []

  constructor (conditions: ConditionElement[]) {
    this.conditions = conditions
  }

  getAPICondition (): APIConditionGroup {
    const apiCondition = new APIConditionGroup('OR', this.conditions.map(condition => condition.getAPICondition()))
    return apiCondition
  }
}

class Condition implements ConditionElement {
  field: string
  operator: Operator
  value: string | number | boolean
  constructor (field: string, operator: Operator, value: string | number | boolean) {
    this.field = field
    this.operator = operator
    this.value = value
  }

  getAPICondition (): APICondition {
    const apiCondition = new APICondition(this.field, this.translateOperator(this.operator), [this.value.toString()])
    return apiCondition
  }

  translateOperator (operator: Operator): APIOperator {
    switch (operator) {
      case Operator.EQUAL:
        return '='
      case Operator.GREATER_THAN:
        return '>'
      case Operator.LESS_THAN:
        return '<'
      case Operator.NOT_EQUAL:
        return '!='
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
