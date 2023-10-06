import { Environment, Condition, Operator, ResourceRequest, AvailabilitySlotType } from '../src/index'
import GoMeddoAPI from '../src/api/gomeddo-api-requests'
import AvailabilityTimeSlotRequest from '../src/api/request-bodies/availability-request'
import ServiceTimeSlotRequest from '../src/api/request-bodies/service-availability-request'
import { ResourceGenerator } from './__utils__/resource-responses'
import { dummyId0, dummyId1 } from './__utils__/salesforce-dummy-ids'
import { getAvailabilityResponse, getAvailabilitySlot, getServiceResponse, getServiceSlot } from './__utils__/availability-responses'
import DimensionSearchBody from '../src/api/request-bodies/dimension-search-body'
import { APICondition, APIConditionElement, APIConditionGroup } from '../src/api/request-bodies/api-condition'
import { FetchMock } from 'jest-fetch-mock/types'

const baseResourceSearchUrl = 'https://api.gomeddo.com/api/v3/proxy/B25/v1/dimensionRecords/search'
const availabilityRequestUrl = 'https://api.gomeddo.com/api/v3/proxy/B25/v1/availability'
const serviceRequestUrl = 'https://api.gomeddo.com/api/v3/proxy/B25/v1/services/availability'
const getResourceRequest = (): ResourceRequest => new ResourceRequest(new GoMeddoAPI('key', Environment.PRODUCTION))
const getExpectedBody = (ids: string[], names: string[], condition: APIConditionElement | undefined): String => {
  return JSON.stringify(new DimensionSearchBody('B25__Resource__c', ids, names, condition, true))
}

beforeEach(() => {
  fetchMock.resetMocks()
})

test('It calls the GoMeddo resurces endpoint when provided with no additional info', async () => {
  const resourceRequest = getResourceRequest()
  const mock = fetchMock.once('[]')
  const result = await resourceRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, [])
  expect(result.numberOfresources()).toBe(0)
})

test('It adds the field if added to the request', async () => {
  const resourceRequest = getResourceRequest()
  resourceRequest.includeAdditionalField('B25__Api_Visible__c')
  const mock = fetchMock.once('[]')
  const result = await resourceRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, ['B25__Api_Visible__c'])
  expect(result.numberOfresources()).toBe(0)
})

test('It adds the fields if added to the request', async () => {
  const resourceRequest = getResourceRequest()
  resourceRequest.includeAdditionalFields(new Set(['B25__Api_Visible__c', 'B25__Booker25_Id__c']))
  const mock = fetchMock.once('[]')
  const result = await resourceRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, ['B25__Api_Visible__c', 'B25__Booker25_Id__c'])
  expect(result.numberOfresources()).toBe(0)
})

test('It parses the result into resources', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceRequest = getResourceRequest()
  const mock = fetchMock.once(JSON.stringify(
    resourceGenerator.getResourceArray(2)
  ))
  const result = await resourceRequest.getResults()
  expectSearchMockToHaveBeenCalledWith(mock, [], [], undefined, [])
  expect(result.numberOfresources()).toBe(2)
  expect(result.getResource('Name 1')).not.toBeUndefined()
  expect(result.getResource('Name 2')).not.toBeUndefined()
})

test('It adds timelines if requested', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.once(JSON.stringify(
    resourceGenerator.getResourceArray(2)
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
  const result = await getResourceRequest()
    .withAvailableSlotsBetween(new Date(Date.UTC(2022, 0, 1)), new Date(Date.UTC(2022, 0, 2)))
    .getResults()
  expectSearchMockToHaveBeenCalledWith(resourceFetchMock, [], [], undefined, [])

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
  expect(result.numberOfresources()).toBe(1)
  const resourceOne = result.getResource('Name 1')
  expect(resourceOne).not.toBeUndefined()
  expect(resourceOne?.getTimeSlots().length).toBe(4)
  expect(resourceOne?.getTimeSlots()[0].type).toBe(AvailabilitySlotType.CLOSED)
  expect(resourceOne?.getTimeSlots()[0].startOfSlot).toBe('2022-01-01T00:00:00.000Z')
  expect(resourceOne?.getTimeSlots()[0].endOfSlot).toBe('2022-01-01T08:00:00.000Z')
  expect(resourceOne?.getTimeSlots()[1].type).toBe(AvailabilitySlotType.RESERVATION)
  expect(resourceOne?.getTimeSlots()[1].startOfSlot).toBe('2022-01-01T08:00:00.000Z')
  expect(resourceOne?.getTimeSlots()[1].endOfSlot).toBe('2022-01-01T12:00:00.000Z')
  expect(resourceOne?.getTimeSlots()[2].type).toBe(AvailabilitySlotType.OPEN)
  expect(resourceOne?.getTimeSlots()[2].startOfSlot).toBe('2022-01-01T12:00:00.000Z')
  expect(resourceOne?.getTimeSlots()[2].endOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(resourceOne?.getTimeSlots()[3].type).toBe(AvailabilitySlotType.CLOSED)
  expect(resourceOne?.getTimeSlots()[3].startOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(resourceOne?.getTimeSlots()[3].endOfSlot).toBe('2022-01-02T00:00:00.000Z')

  // Fully closed so should be filtered out
  const resourceTwo = result.getResource('Name 2')
  expect(resourceTwo).toBeUndefined()
})

test('It adds service timelines if requested', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  fetchMock.once(JSON.stringify(resourceGenerator.getResourceArray(2)))
  fetchMock.once(JSON.stringify(getAvailabilityResponse(['1', '2'], [
    getAvailabilitySlot(1, 0, 2, 0, 'Open')
  ])))
  const serviceAvailabilityFetchMock = fetchMock.once(JSON.stringify(
    {
      resources: {
        1: getServiceResponse(['1'], ['1', '2'], [
          getServiceSlot(1, 0, 1, 10, 10),
          getServiceSlot(1, 10, 1, 16, 5),
          getServiceSlot(1, 16, 2, 0, 10)
        ]).resources['1'],
        2: getServiceResponse(['2'], ['1'], []).resources['2']
      }
    }
  ))

  const result = await getResourceRequest()
    .withAvailableSlotsBetween(new Date(Date.UTC(2022, 0, 1)), new Date(Date.UTC(2022, 0, 2)))
    .includeServices(true)
    .getResults()
  const requestBody = new ServiceTimeSlotRequest(
    new Date(Date.UTC(2022, 0, 1)),
    new Date(Date.UTC(2022, 0, 2)),
    ['Id 1', 'Id 2']
  )

  expect(serviceAvailabilityFetchMock).toBeCalledWith(serviceRequestUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { Authorization: 'Bearer key' }
  })
  expect(result.numberOfresources()).toBe(2)
  const resourceOne = result.getResource('Name 1')
  expect(resourceOne).not.toBeUndefined()
  expect(resourceOne?.getAvailableServices().length).toBe(2)
  const serviceOne = resourceOne?.getService('Service Name 1')
  expect(serviceOne?.timeSlots[0].remainingQuantity).toBe(10)
  expect(serviceOne?.timeSlots[0].startOfSlot).toBe('2022-01-01T00:00:00.000Z')
  expect(serviceOne?.timeSlots[0].endOfSlot).toBe('2022-01-01T10:00:00.000Z')
  expect(serviceOne?.timeSlots[1].remainingQuantity).toBe(5)
  expect(serviceOne?.timeSlots[1].startOfSlot).toBe('2022-01-01T10:00:00.000Z')
  expect(serviceOne?.timeSlots[1].endOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(serviceOne?.timeSlots[2].remainingQuantity).toBe(10)
  expect(serviceOne?.timeSlots[2].startOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(serviceOne?.timeSlots[2].endOfSlot).toBe('2022-01-02T00:00:00.000Z')
  const serviceTwo = resourceOne?.getService('Service Name 2')
  expect(serviceTwo).not.toBeUndefined()

  const resourceTwo = result.getResource('Name 2')
  const serviceOneOnResourceTwo = resourceTwo?.getService('Service Name 1')
  expect(serviceOneOnResourceTwo).not.toBeUndefined()
  const serviceTwoOnResourceTwo = resourceTwo?.getService('Service Name 2')
  expect(serviceTwoOnResourceTwo).toBeUndefined()
})

test('It requests parent scope if requested', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.once(JSON.stringify(resourceGenerator.getResourceArray(2)))

  await getResourceRequest()
    .includeAllResourcesAt(dummyId0)
    .getResults()
  expectSearchMockToHaveBeenCalledWith(resourceFetchMock, [dummyId0], [], undefined, [])
})

test('It combines multiple parents into a single request', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.doMock(JSON.stringify(resourceGenerator.getResourceArray(2)))

  await getResourceRequest()
    .includeAllResourcesAt(dummyId0, dummyId1)
    .getResults()
  expectSearchMockToHaveBeenCalledWith(resourceFetchMock, [dummyId0, dummyId1], [], undefined, [])
})

test('It adds a type id to the request if a type is requested', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.doMock(JSON.stringify(resourceGenerator.getResourceArray(2)))

  await getResourceRequest()
    .withType(dummyId0, dummyId1)
    .getResults()
  const expectedCondition =
    new APIConditionGroup('AND', [
      new APIConditionGroup('OR', [
        new APICondition('B25__Resource_Type__r.Name', '=', [dummyId0]),
        new APICondition('B25__Resource_Type__r.Name', '=', [dummyId1])
      ])
    ])
  expect(resourceFetchMock).toBeCalledTimes(1)
  expectSearchMockToHaveBeenCalledWith(resourceFetchMock, [], [], expectedCondition, [])
})

test('It passes the condition to the search endpoint', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.doMock(JSON.stringify(resourceGenerator.getResourceArray(2)))

  await getResourceRequest()
    .withCondition(new Condition('B25__Api_Visible__c', Operator.EQUAL, true))
    .getResults()
  const expectedCondition = new APIConditionGroup('AND', [
    new APIConditionGroup('OR', [
      new APICondition('B25__Api_Visible__c', '=', ['true'])
    ])
  ])
  expect(resourceFetchMock).toBeCalledTimes(1)
  expectSearchMockToHaveBeenCalledWith(resourceFetchMock, [], [], expectedCondition, [])
})

test('It conbines conditions with an and grouping', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.doMock(JSON.stringify(resourceGenerator.getResourceArray(2)))

  await getResourceRequest()
    .withCondition(
      new Condition('B25__Api_Visible__c', Operator.EQUAL, true),
      new Condition('B25__Capacity__c', Operator.LESS_THAN, 25)
    )
    .getResults()

  const expectedCondition = new APIConditionGroup('AND', [
    new APIConditionGroup('OR', [
      new APIConditionGroup('AND', [
        new APICondition('B25__Api_Visible__c', '=', ['true']),
        new APICondition('B25__Capacity__c', '<', ['25'])
      ])
    ])
  ])
  expect(resourceFetchMock).toBeCalledTimes(1)
  expectSearchMockToHaveBeenCalledWith(resourceFetchMock, [], [], expectedCondition, [])
})

test('It combines types and conditions with an and grouping', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.doMock(JSON.stringify(resourceGenerator.getResourceArray(2)))

  await getResourceRequest()
    .withCondition(new Condition('B25__Api_Visible__c', Operator.EQUAL, true))
    .withType(dummyId0, dummyId1)
    .getResults()

  const expectedCondition = new APIConditionGroup('AND', [
    new APIConditionGroup('OR', [
      new APICondition('B25__Resource_Type__r.Name', '=', [dummyId0]),
      new APICondition('B25__Resource_Type__r.Name', '=', [dummyId1])
    ]),
    new APIConditionGroup('OR', [
      new APICondition('B25__Api_Visible__c', '=', ['true'])
    ])
  ])
  expect(resourceFetchMock).toBeCalledTimes(1)
  expectSearchMockToHaveBeenCalledWith(resourceFetchMock, [], [], expectedCondition, [])
})

test('It filters the results based on multiple conditions', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resources = resourceGenerator.getResourceArray(2)
  resources[0].B25__Api_Visible__c = true
  resources[0].B25__Capacity__c = 20
  resources[1].B25__Api_Visible__c = false
  resources[1].B25__Capacity__c = 30
  fetchMock.doMock(JSON.stringify(resources))

  const result = await getResourceRequest()
    .withCondition(new Condition('B25__Api_Visible__c', Operator.EQUAL, true))
    .withCondition(new Condition('B25__Capacity__c', Operator.GREATER_THAN, 25))
    .getResults()

  expect(result.numberOfresources()).toBe(2)
})

const expectSearchMockToHaveBeenCalledWith = (mock: FetchMock, ids: string[], names: string[], condition: APIConditionElement | undefined, fields: string[]): void => {
  const expectedUrl = `${baseResourceSearchUrl}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c${fields.length !== 0 ? '%2C' : ''}${fields.join('%2C')}`
  expect(mock).toBeCalledWith(expectedUrl,
    {
      method: 'POST',
      body: getExpectedBody(ids, names, condition),
      headers: { Authorization: 'Bearer key' }
    }
  )
}
