import SObject, { Condition, Operator } from '../../src/s-objects/s-object'
import { getSObject } from '../__utils__/s-object-data'

test('You can set/get custom properties', () => {
  const sObject = new SObject()
  sObject.setCustomProperty('B25__Resource__c', 'test')
  expect(sObject.getCustomProperty('B25__Resource__c')).toBe('test')
})

test('It parses an input sObject into custom properties', () => {
  const sObject = new SObject({ ...getSObject(), B25__Resource__c: 'test' })
  expect(sObject.getCustomProperty('B25__Resource__c')).toBe('test')
})

test('It ignores properties when provided', () => {
  const sObject = new SObject({ ...getSObject(), B25__Resource__c: 'test', B25__Staff__c: 'test2' }, new Set(['B25__Resource__c']))
  expect(sObject.getCustomProperty('B25__Resource__c')).toBeUndefined()
  expect(sObject.getCustomProperty('B25__Staff__c')).toBe('test2')
})

test('It converts custom properties back into a simple sObject format', () => {
  const data = { ...getSObject(), B25__Resource__c: 'test', B25__Staff__c: 'test2' }
  const sObject = new SObject(data)
  const restData = sObject.getSFSObject()
  expect(restData).toStrictEqual(data)
})

test('It can match a condition equal and not equal', () => {
  const data = { ...getSObject(), B25__Resource__c: 'test' }
  const sObject = new SObject(data)
  expect(new Condition('B25__Resource__c', Operator.EQUAL, 'test').matches(sObject)).toBe(true)
  expect(new Condition('B25__Resource__c', Operator.NOT_EQUAL, 'test').matches(sObject)).toBe(false)
  expect(new Condition('B25__Resource__c', Operator.EQUAL, 'test2').matches(sObject)).toBe(false)
  expect(new Condition('B25__Resource__c', Operator.NOT_EQUAL, 'test2').matches(sObject)).toBe(true)
})

test('It can match a condition greater and less than', () => {
  const data = { ...getSObject(), B25__Capacity__c: 10 }
  const sObject = new SObject(data)
  expect(new Condition('B25__Capacity__c', Operator.GREATER_THAN, 5).matches(sObject)).toBe(true)
  expect(new Condition('B25__Capacity__c', Operator.LESS_THAN, 5).matches(sObject)).toBe(false)
  expect(new Condition('B25__Capacity__c', Operator.GREATER_THAN, 15).matches(sObject)).toBe(false)
  expect(new Condition('B25__Capacity__c', Operator.LESS_THAN, 15).matches(sObject)).toBe(true)
})
