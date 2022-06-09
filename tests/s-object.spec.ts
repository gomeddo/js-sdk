import SObject from '../src/s-object'

test('You can set/get custom properties', () => {
  const sObject = new SObject()
  sObject.setCustomProperty('B25__Resource__c', 'test')
  expect(sObject.getCustomProperty('B25__Resource__c')).toBe('test')
})

test('It parses an input sObject into custom properties', () => {
  const sObject = new SObject({ B25__Resource__c: 'test' })
  expect(sObject.getCustomProperty('B25__Resource__c')).toBe('test')
})

test('It ignores properties when provided', () => {
  const sObject = new SObject({ B25__Resource__c: 'test', B25__Staff__c: 'test2' }, new Set(['B25__Resource__c']))
  expect(sObject.getCustomProperty('B25__Resource__c')).toBeUndefined()
  expect(sObject.getCustomProperty('B25__Staff__c')).toBe('test2')
})

test('It converts custom properties back into a simple sObject format', () => {
  const data = { B25__Resource__c: 'test', B25__Staff__c: 'test2' }
  const sObject = new SObject(data)
  const restData = sObject.getRestData()
  expect(restData).toStrictEqual(data)
})
