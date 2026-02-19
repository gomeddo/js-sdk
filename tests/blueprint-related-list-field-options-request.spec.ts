import { Environment } from '../src/index'

import GoMeddoAPI from '../src/api/gomeddo-api-requests'
import BlueprintFieldOptionsBody from '../src/api/request-bodies/blueprint-field-options-body'
import { FetchMock } from 'jest-fetch-mock/types'
import BlueprintRelatedListFieldOptionsRequest from '../src/blueprint-related-list-field-options-request'

const baseUrl = 'https://api.gomeddo.com/api/v3/proxy/B25/v1/blueprints'
const blueprintId = 'blueprint123'
const relatedListId = 'relatedList456'
const fieldId = 'field789'

const getRequest = (): BlueprintRelatedListFieldOptionsRequest =>
  new BlueprintRelatedListFieldOptionsRequest(new GoMeddoAPI('YOUR_API_KEY', Environment.PRODUCTION), blueprintId, relatedListId, fieldId)

beforeEach(() => {
  fetchMock.resetMocks()
})

test('It calls the correct URL with all three identifiers', async () => {
  const request = getRequest()
  const mock = fetchMock.once('[]')
  const result = await request.getResults()
  expectMockToHaveBeenCalledWith(mock, {}, [])
  expect(result.numberOfOptions()).toBe(0)
})

test('It passes the prototype in the POST body', async () => {
  const request = getRequest()
  request.setPrototype({ B25__Resource__c: 'someResourceId' })
  const mock = fetchMock.once('[]')
  await request.getResults()
  expectMockToHaveBeenCalledWith(mock, { B25__Resource__c: 'someResourceId' }, [])
})

test('It appends additional fields as query params', async () => {
  const request = getRequest()
  request.includeAdditionalField('B25__Api_Visible__c')
  const mock = fetchMock.once('[]')
  await request.getResults()
  expectMockToHaveBeenCalledWith(mock, {}, ['B25__Api_Visible__c'])
})

test('It appends multiple additional fields as query params', async () => {
  const request = getRequest()
  request.includeAdditionalFields(new Set(['B25__Api_Visible__c', 'B25__Booker25_Id__c']))
  const mock = fetchMock.once('[]')
  await request.getResults()
  expectMockToHaveBeenCalledWith(mock, {}, ['B25__Api_Visible__c', 'B25__Booker25_Id__c'])
})

test('It wraps the result in a BlueprintFieldOptionsResult', async () => {
  const request = getRequest()
  fetchMock.once(JSON.stringify([
    { Id: 'opt1', Name: 'Option 1' },
    { Id: 'opt2', Name: 'Option 2' }
  ]))
  const result = await request.getResults()
  expect(result.numberOfOptions()).toBe(2)
  expect(result.getRecord('opt1')).not.toBeUndefined()
  expect(result.getRecord('opt2')).not.toBeUndefined()
})

test('It supports setFieldOnPrototype', async () => {
  const request = getRequest()
  request.setFieldOnPrototype('B25__Resource__c', 'resourceId')
  const mock = fetchMock.once('[]')
  await request.getResults()
  expectMockToHaveBeenCalledWith(mock, { B25__Resource__c: 'resourceId' }, [])
})

const expectMockToHaveBeenCalledWith = (mock: FetchMock, prototype: object, additionalFields: string[]): void => {
  const expectedUrl = `${baseUrl}/${blueprintId}/relatedLists/${relatedListId}/fields/${fieldId}/options?fields=Id%2CName${additionalFields.length !== 0 ? '%2C' : ''}${additionalFields.join('%2C')}`
  const expectedBody = JSON.stringify(new BlueprintFieldOptionsBody(prototype))
  expect(mock).toBeCalledWith(expectedUrl,
    {
      method: 'POST',
      body: expectedBody,
      headers: { Authorization: 'Bearer YOUR_API_KEY' }
    }
  )
}
