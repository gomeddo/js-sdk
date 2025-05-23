import { Environment, Condition, Operator } from '../src/index'

import GoMeddoAPI from '../src/api/gomeddo-api-requests'
import BlueprintSearchBody from '../src/api/request-bodies/blueprint-search-body'
import { APICondition, APIConditionElement, APIConditionGroup } from '../src/api/request-bodies/api-condition'
import { FetchMock } from 'jest-fetch-mock/types'
import BlueprintRecordRequest, { IBlueprintRecordRequest } from '../src/blueprint-record-request'
import { BlueprintRecordGenerator } from './__utils__/blueprint-record-responses'

const baseBlueprintRecordsSearchUrl = 'https://api.gomeddo.com/api/v3/proxy/B25/v1/blueprints/search'

const request: IBlueprintRecordRequest = {
  api: new GoMeddoAPI('9c30c47d-3033-472e-8bba-cf027322635d', Environment.PRODUCTION)
}

const getBlueprintRecordRequest = (): BlueprintRecordRequest => new BlueprintRecordRequest(request)
const getExpectedBody = (ids: string[], names: string[], condition: APIConditionElement | undefined): String => {
  return JSON.stringify(new BlueprintSearchBody(ids, names, condition))
}

beforeEach(() => {
  fetchMock.resetMocks()
})

test('It calls the GoMeddo blueprint record endpoint when provided with no additional info', async () => {
  const blueprintRecordRequest = getBlueprintRecordRequest()
  const mock = fetchMock.once('[]')
  const result = await blueprintRecordRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, [])
  expect(result.numberOfBlueprintRecords()).toBe(0)
})

test('It adds the field if added to the request', async () => {
  const blueprintRecordRequest = getBlueprintRecordRequest()
  blueprintRecordRequest.includeAdditionalField('B25__Api_Visible__c')
  const mock = fetchMock.once('[]')
  const result = await blueprintRecordRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, ['B25__Api_Visible__c'])
  expect(result.numberOfBlueprintRecords()).toBe(0)
})

test('It adds the fields if added to the request', async () => {
  const blueprintRecordRequest = getBlueprintRecordRequest()
  blueprintRecordRequest.includeAdditionalFields(new Set(['B25__Api_Visible__c', 'B25__Booker25_Id__c']))
  const mock = fetchMock.once('[]')
  const result = await blueprintRecordRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, ['B25__Api_Visible__c', 'B25__Booker25_Id__c'])
  expect(result.numberOfBlueprintRecords()).toBe(0)
})

test('It parses the result into blueprint records', async () => {
  const blueprintRecordGenerator = new BlueprintRecordGenerator('Id', 'Name')
  const blueprintRecordRequest = getBlueprintRecordRequest()
  const mock = fetchMock.once(JSON.stringify(
    blueprintRecordGenerator.getBlueprintArray(2)
  ))
  const result = await blueprintRecordRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, [])
  expect(result.numberOfBlueprintRecords()).toBe(2)
  expect(result.getBlueprintRecord('Name 1')).not.toBeUndefined()
  expect(result.getBlueprintRecord('Name 2')).not.toBeUndefined()
})

test('It passes the condition to the search endpoint', async () => {
  const blueprintRecordGenerator = new BlueprintRecordGenerator('Id', 'Name')
  const blueprintRecordFetchMock = fetchMock.doMock(JSON.stringify(blueprintRecordGenerator.getBlueprintArray(2)))

  await getBlueprintRecordRequest()
    .withCondition(new Condition('B25__Api_Visible__c', Operator.EQUAL, true))
    .getResults()
  const expectedCondition = new APIConditionGroup('OR', [
    new APICondition('B25__Api_Visible__c', '=', ['true'])
  ])
  expect(blueprintRecordFetchMock).toBeCalledTimes(1)
  expectSearchMockToHaveBeenCalledWith(blueprintRecordFetchMock, [], [], expectedCondition, [])
})

test('It conbines conditions with an and grouping', async () => {
  const blueprintRecordGenerator = new BlueprintRecordGenerator('Id', 'Name')
  const blueprintRecordFetchMock = fetchMock.doMock(JSON.stringify(blueprintRecordGenerator.getBlueprintArray(2)))

  await getBlueprintRecordRequest()
    .withCondition(
      new Condition('B25__Api_Visible__c', Operator.EQUAL, true),
      new Condition('B25__Capacity__c', Operator.LESS_THAN, 25)
    )
    .getResults()

  const expectedCondition = new APIConditionGroup('OR', [new APIConditionGroup('AND', [
    new APICondition('B25__Api_Visible__c', '=', ['true']),
    new APICondition('B25__Capacity__c', '<', ['25'])
  ])])
  expect(blueprintRecordFetchMock).toBeCalledTimes(1)
  expectSearchMockToHaveBeenCalledWith(blueprintRecordFetchMock, [], [], expectedCondition, [])
})

test('It filters the results based on multiple conditions', async () => {
  const blueprintRecordGenerator = new BlueprintRecordGenerator('Id', 'Name')
  const blueprintRecords = blueprintRecordGenerator.getBlueprintArray(2)
  blueprintRecords[0].B25__Api_Visible__c = true
  blueprintRecords[0].B25__Capacity__c = 20
  blueprintRecords[1].B25__Api_Visible__c = false
  blueprintRecords[1].B25__Capacity__c = 30
  fetchMock.doMock(JSON.stringify(blueprintRecords))

  const result = await getBlueprintRecordRequest()
    .withCondition(new Condition('B25__Api_Visible__c', Operator.EQUAL, true))
    .withCondition(new Condition('B25__Capacity__c', Operator.GREATER_THAN, 25))
    .getResults()

  expect(result.numberOfBlueprintRecords()).toBe(2)
})

const expectSearchMockToHaveBeenCalledWith = (mock: FetchMock, ids: string[], names: string[], condition: APIConditionElement | undefined, fields: string[]): void => {
  const expectedUrl = `${baseBlueprintRecordsSearchUrl}?fields=Id%2CName${fields.length !== 0 ? '%2C' : ''}${fields.join('%2C')}`
  expect(mock).toBeCalledWith(expectedUrl,
    {
      method: 'POST',
      body: getExpectedBody(ids, names, condition),
      headers: { Authorization: 'Bearer key' }
    }
  )
}
