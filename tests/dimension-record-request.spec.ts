import { Environment, Condition, Operator, AvailabilitySlotType } from '../src/index'
import GoMeddoAPI from '../src/api/gomeddo-api-requests'
import AvailabilityTimeSlotRequest from '../src/api/request-bodies/availability-request'
import { getAvailabilityResponse, getAvailabilitySlot } from './__utils__/availability-responses'
import DimensionSearchBody from '../src/api/request-bodies/dimension-search-body'
import { APICondition, APIConditionElement, APIConditionGroup } from '../src/api/request-bodies/api-condition'
import { FetchMock } from 'jest-fetch-mock/types'
import DimensionRecordRequest from '../src/dimension-record-request'
import { DimensionRecordGenerator } from './__utils__/dimension-record-responses'

const baseDimensionRecordsSearchUrl = 'https://api.gomeddo.com/api/v3/proxy/B25/v1/dimensionRecords/search'
const availabilityRequestUrl = 'https://api.gomeddo.com/api/v3/proxy/B25/v1/availability'
const getDimensionRecordRequest = (): DimensionRecordRequest => new DimensionRecordRequest(new GoMeddoAPI('key', Environment.PRODUCTION))
const getExpectedBody = (ids: string[], names: string[], condition: APIConditionElement | undefined): String => {
  return JSON.stringify(new DimensionSearchBody('B25__Resource__c', ids, names, condition, true))
}

beforeEach(() => {
  fetchMock.resetMocks()
})

test('It calls the GoMeddo dimension record endpoint when provided with no additional info', async () => {
  const dimensionRecordRequest = getDimensionRecordRequest()
  const mock = fetchMock.once('[]')
  const result = await dimensionRecordRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, [])
  expect(result.numberOfDimensionRecords()).toBe(0)
})

test('It adds the field if added to the request', async () => {
  const dimensionRecordRequest = getDimensionRecordRequest()
  dimensionRecordRequest.includeAdditionalField('B25__Api_Visible__c')
  const mock = fetchMock.once('[]')
  const result = await dimensionRecordRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, ['B25__Api_Visible__c'])
  expect(result.numberOfDimensionRecords()).toBe(0)
})

test('It adds the fields if added to the request', async () => {
  const dimensionRecordRequest = getDimensionRecordRequest()
  dimensionRecordRequest.includeAdditionalFields(new Set(['B25__Api_Visible__c', 'B25__Booker25_Id__c']))
  const mock = fetchMock.once('[]')
  const result = await dimensionRecordRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, ['B25__Api_Visible__c', 'B25__Booker25_Id__c'])
  expect(result.numberOfDimensionRecords()).toBe(0)
})

test('It parses the result into dimension records', async () => {
  const dimensionRecordGenerator = new DimensionRecordGenerator('Id', 'Name')
  const dimensionRecordRequest = getDimensionRecordRequest()
  const mock = fetchMock.once(JSON.stringify(
    dimensionRecordGenerator.getDimensionArray(2)
  ))
  const result = await dimensionRecordRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, [])
  expect(result.numberOfDimensionRecords()).toBe(2)
  expect(result.getDimensionRecord('Name 1')).not.toBeUndefined()
  expect(result.getDimensionRecord('Name 2')).not.toBeUndefined()
})

test('It adds timelines if requested', async () => {
  const dimensionRecordGenerator = new DimensionRecordGenerator('Id', 'Name')
  const dimensionRecordFetchMock = fetchMock.once(JSON.stringify(
    dimensionRecordGenerator.getDimensionArray(2)
  ))
  const availabilityFetchMock = fetchMock.once(JSON.stringify(
    [
      getAvailabilityResponse(['1'], [
        getAvailabilitySlot(1, 0, 1, 8, 'Closed'),
        getAvailabilitySlot(1, 8, 1, 16, 'Open'),
        getAvailabilitySlot(1, 16, 2, 0, 'Closed'),
        getAvailabilitySlot(1, 6, 1, 12, 'Reservation')
      ])[0],
      getAvailabilityResponse(['2'], [
        getAvailabilitySlot(1, 0, 2, 0, 'Closed')
      ])[0]
    ]
  ))
  const result = await getDimensionRecordRequest()
    .withAvailableSlotsBetween(new Date(Date.UTC(2022, 0, 1)), new Date(Date.UTC(2022, 0, 2)))
    .getResults()
  expectSearchMockToHaveBeenCalledWith(dimensionRecordFetchMock, [], [], undefined, [])

  const requestBody = new AvailabilityTimeSlotRequest(
    new Date(Date.UTC(2022, 0, 1)),
    new Date(Date.UTC(2022, 0, 2)),
    ['Id 1', 'Id 2']
  )
  expect(availabilityFetchMock).toBeCalledWith(availabilityRequestUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { Authorization: 'Bearer key' }
  })
  expect(result.numberOfDimensionRecords()).toBe(1)
  const dimensionRecordOne = result.getDimensionRecord('Name 1')
  expect(dimensionRecordOne).not.toBeUndefined()
  expect(dimensionRecordOne?.getTimeSlots().length).toBe(4)
  expect(dimensionRecordOne?.getTimeSlots()[0].type).toBe(AvailabilitySlotType.CLOSED)
  expect(dimensionRecordOne?.getTimeSlots()[0].startOfSlot).toBe('2022-01-01T00:00:00.000Z')
  expect(dimensionRecordOne?.getTimeSlots()[0].endOfSlot).toBe('2022-01-01T08:00:00.000Z')
  expect(dimensionRecordOne?.getTimeSlots()[1].type).toBe(AvailabilitySlotType.RESERVATION)
  expect(dimensionRecordOne?.getTimeSlots()[1].startOfSlot).toBe('2022-01-01T08:00:00.000Z')
  expect(dimensionRecordOne?.getTimeSlots()[1].endOfSlot).toBe('2022-01-01T12:00:00.000Z')
  expect(dimensionRecordOne?.getTimeSlots()[2].type).toBe(AvailabilitySlotType.OPEN)
  expect(dimensionRecordOne?.getTimeSlots()[2].startOfSlot).toBe('2022-01-01T12:00:00.000Z')
  expect(dimensionRecordOne?.getTimeSlots()[2].endOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(dimensionRecordOne?.getTimeSlots()[3].type).toBe(AvailabilitySlotType.CLOSED)
  expect(dimensionRecordOne?.getTimeSlots()[3].startOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(dimensionRecordOne?.getTimeSlots()[3].endOfSlot).toBe('2022-01-02T00:00:00.000Z')

  // Fully closed so should be filtered out
  const dimensionRecordTwo = result.getDimensionRecord('Name 2')
  expect(dimensionRecordTwo).toBeUndefined()
})

test('It passes the condition to the search endpoint', async () => {
  const dimensionRecordGenerator = new DimensionRecordGenerator('Id', 'Name')
  const dimensionRecordFetchMock = fetchMock.doMock(JSON.stringify(dimensionRecordGenerator.getDimensionArray(2)))

  await getDimensionRecordRequest()
    .withCondition(new Condition('B25__Api_Visible__c', Operator.EQUAL, true))
    .getResults()
  const expectedCondition = new APIConditionGroup('OR', [
    new APICondition('B25__Api_Visible__c', '=', ['true'])
  ])
  expect(dimensionRecordFetchMock).toBeCalledTimes(1)
  expectSearchMockToHaveBeenCalledWith(dimensionRecordFetchMock, [], [], expectedCondition, [])
})

test('It conbines conditions with an and grouping', async () => {
  const dimensionRecordGenerator = new DimensionRecordGenerator('Id', 'Name')
  const dimensionRecordFetchMock = fetchMock.doMock(JSON.stringify(dimensionRecordGenerator.getDimensionArray(2)))

  await getDimensionRecordRequest()
    .withCondition(
      new Condition('B25__Api_Visible__c', Operator.EQUAL, true),
      new Condition('B25__Capacity__c', Operator.LESS_THAN, 25)
    )
    .getResults()

  const expectedCondition = new APIConditionGroup('OR', [new APIConditionGroup('AND', [
    new APICondition('B25__Api_Visible__c', '=', ['true']),
    new APICondition('B25__Capacity__c', '<', ['25'])
  ])])
  expect(dimensionRecordFetchMock).toBeCalledTimes(1)
  expectSearchMockToHaveBeenCalledWith(dimensionRecordFetchMock, [], [], expectedCondition, [])
})

test('It filters the results based on multiple conditions', async () => {
  const dimensionRecordGenerator = new DimensionRecordGenerator('Id', 'Name')
  const dimensionRecords = dimensionRecordGenerator.getDimensionArray(2)
  dimensionRecords[0].B25__Api_Visible__c = true
  dimensionRecords[0].B25__Capacity__c = 20
  dimensionRecords[1].B25__Api_Visible__c = false
  dimensionRecords[1].B25__Capacity__c = 30
  fetchMock.doMock(JSON.stringify(dimensionRecords))

  const result = await getDimensionRecordRequest()
    .withCondition(new Condition('B25__Api_Visible__c', Operator.EQUAL, true))
    .withCondition(new Condition('B25__Capacity__c', Operator.GREATER_THAN, 25))
    .getResults()

  expect(result.numberOfDimensionRecords()).toBe(2)
})

const expectSearchMockToHaveBeenCalledWith = (mock: FetchMock, ids: string[], names: string[], condition: APIConditionElement | undefined, fields: string[]): void => {
  const expectedUrl = `${baseDimensionRecordsSearchUrl}?fields=Id%2CName${fields.length !== 0 ? '%2C' : ''}${fields.join('%2C')}`
  expect(mock).toBeCalledWith(expectedUrl,
    {
      method: 'POST',
      body: getExpectedBody(ids, names, condition),
      headers: { Authorization: 'Bearer key' }
    }
  )
}
