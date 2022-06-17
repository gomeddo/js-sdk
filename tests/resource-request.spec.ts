import { Enviroment } from '../src/index'
import Booker25API from '../src/api/booker25-api-requests'
import ResourceRequest from '../src/resource-request'
import { ResourceGenerator } from './__utils__/resource-responses'
import { getAvailabilityResponse, getAvailabilitySlot, getServiceResponse, getServiceSlot } from './__utils__/availability-responses'
import AvailabilityTimeSlotRequest from '../src/api/availability-request'
import { AvailabilitySlotType } from '../src/time-slots/availability-time-slot'
import ServiceTimeSlotRequest from '../src/api/service-availability-request'
import { dummyId0, dummyId1, dummyId2, dummyId3 } from './__utils__/salesforce-dummy-ids'
import { Condition, Operator } from '../src/s-objects/s-object'

const baseResourceRequestUrl = 'https://api.booker25.com/api/v3/proxy/resources'
const availabilityRequestUrl = 'https://api.booker25.com/api/v3/proxy/availability'
const serviceRequestUrl = 'https://api.booker25.com/api/v3/proxy/serviceAvailability'
const childResourceUrl = (parentId: string): string => `https://api.booker25.com/api/v3/proxy/resources/${parentId}/children`

beforeEach(() => {
  fetchMock.resetMocks()
})

test('It calls the booker25 resurces endpoint when provided with no additional info', async () => {
  const resourceRequest = new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
  const mock = fetchMock.once('[]')
  const result = await resourceRequest.getResults()
  expect(mock).toBeCalledWith(`${baseResourceRequestUrl}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c`)
  expect(result.numberOfresources()).toBe(0)
})

test('It adds the field if added to the request', async () => {
  const resourceRequest = new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
  resourceRequest.withAdditionalField('B25__Api_Visible__c')
  const mock = fetchMock.once('[]')
  const result = await resourceRequest.getResults()
  expect(mock).toBeCalledWith(`${baseResourceRequestUrl}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c%2CB25__Api_Visible__c`)
  expect(result.numberOfresources()).toBe(0)
})

test('It adds the fields if added to the request', async () => {
  const resourceRequest = new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
  resourceRequest.withAdditionalFields(new Set(['B25__Api_Visible__c', 'B25__Booker25_Id__c']))
  const mock = fetchMock.once('[]')
  const result = await resourceRequest.getResults()
  expect(mock).toBeCalledWith(`${baseResourceRequestUrl}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c%2CB25__Api_Visible__c%2CB25__Booker25_Id__c`)
  expect(result.numberOfresources()).toBe(0)
})

test('It parses the result into resources', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceRequest = new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
  const mock = fetchMock.once(JSON.stringify(
    resourceGenerator.getResourceArray(2)
  ))
  const result = await resourceRequest.getResults()
  expect(mock).toBeCalledWith(`${baseResourceRequestUrl}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c`)
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
  const result = await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .withAvailableSlotsBetween(new Date(Date.UTC(2022, 0, 1)), new Date(Date.UTC(2022, 0, 2)))
    .getResults()
  expect(resourceFetchMock).toBeCalledWith(`${baseResourceRequestUrl}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c`)
  const requestBody = new AvailabilityTimeSlotRequest(
    new Date(Date.UTC(2022, 0, 1)),
    new Date(Date.UTC(2022, 0, 2)),
    ['Id 1', 'Id 2']
  )
  expect(availabilityFetchMock).toBeCalledWith(availabilityRequestUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody)
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
    [
      getServiceResponse(['1'], ['1', '2'], [
        getServiceSlot(1, 0, 2, 0, 'Availability', 10),
        getServiceSlot(1, 10, 1, 16, 'Reservation', 5)
      ])[0],
      getServiceResponse(['2'], ['1'], [])[0]
    ]
  ))

  const result = await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
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
    body: JSON.stringify(requestBody)
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

  await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .includeAllResourcesAt(dummyId0)
    .getResults()
  expect(resourceFetchMock).toBeCalledWith(`${childResourceUrl(dummyId0)}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c&recursive=true`)
})

test('It requests parent scope multiple times once for each parent', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.doMock(JSON.stringify(resourceGenerator.getResourceArray(2)))

  await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .includeAllResourcesAt(dummyId0, dummyId1)
    .getResults()
  expect(resourceFetchMock).toBeCalledTimes(2)
  expect(resourceFetchMock).toBeCalledWith(`${childResourceUrl(dummyId0)}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c&recursive=true`)
  expect(resourceFetchMock).toBeCalledWith(`${childResourceUrl(dummyId1)}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c&recursive=true`)
})

test('Duplicate results are filtered out', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  // Both requests get the same result of two resources
  const resourceFetchMock = fetchMock.doMock(JSON.stringify(resourceGenerator.getResourceArray(2)))

  const result = await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .includeAllResourcesAt(dummyId0, dummyId1)
    .getResults()
  // Call was ran twice
  expect(resourceFetchMock).toBeCalledTimes(2)
  expect(resourceFetchMock).toBeCalledWith(`${childResourceUrl(dummyId0)}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c&recursive=true`)
  expect(resourceFetchMock).toBeCalledWith(`${childResourceUrl(dummyId1)}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c&recursive=true`)

  // Only two unique resources are returned
  expect(result.numberOfresources()).toBe(2)
})

test('It adds a type id to the request if a type is requested', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.doMock(JSON.stringify(resourceGenerator.getResourceArray(2)))

  await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .withType(dummyId0, dummyId1)
    .getResults()
  expect(resourceFetchMock).toBeCalledTimes(2)
  expect(resourceFetchMock).toBeCalledWith(`${baseResourceRequestUrl}?resourceType=${dummyId0}&fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c`)
  expect(resourceFetchMock).toBeCalledWith(`${baseResourceRequestUrl}?resourceType=${dummyId1}&fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c`)
})

test('It generates combined requests when both parent resources and types are requested', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.doMock(JSON.stringify(resourceGenerator.getResourceArray(2)))

  await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .includeAllResourcesAt(dummyId0, dummyId1)
    .withType(dummyId2, dummyId3)
    .getResults()
  expect(resourceFetchMock).toBeCalledTimes(4)
  expect(resourceFetchMock).toBeCalledWith(`${childResourceUrl(dummyId0)}?resourceType=${dummyId2}&fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c&recursive=true`)
  expect(resourceFetchMock).toBeCalledWith(`${childResourceUrl(dummyId1)}?resourceType=${dummyId3}&fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c&recursive=true`)
  expect(resourceFetchMock).toBeCalledWith(`${childResourceUrl(dummyId0)}?resourceType=${dummyId3}&fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c&recursive=true`)
  expect(resourceFetchMock).toBeCalledWith(`${childResourceUrl(dummyId1)}?resourceType=${dummyId2}&fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c&recursive=true`)
})

test('It filters the results based on a simple condition', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resources = resourceGenerator.getResourceArray(2)
  resources[0].B25__Api_Visible__c = true
  resources[1].B25__Api_Visible__c = false
  fetchMock.doMock(JSON.stringify(resources))

  const result = await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .withCondition(new Condition('B25__Api_Visible__c', Operator.EQUAL, true))
    .getResults()

  expect(result.numberOfresources()).toBe(1)
  expect(result.getResource('Name 1')).toBeDefined()
})

test('It filters the results based on a combined condition', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resources = resourceGenerator.getResourceArray(2)
  resources[0].B25__Api_Visible__c = true
  resources[0].B25__Capacity__c = 20
  resources[1].B25__Api_Visible__c = true
  resources[1].B25__Capacity__c = 30
  fetchMock.doMock(JSON.stringify(resources))

  const result = await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .withCondition(
      new Condition('B25__Api_Visible__c', Operator.EQUAL, true),
      new Condition('B25__Capacity__c', Operator.LESS_THAN, 25)
    )
    .getResults()

  expect(result.numberOfresources()).toBe(1)
  expect(result.getResource('Name 1')).toBeDefined()
})

test('It filters the results based on multiple conditions', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resources = resourceGenerator.getResourceArray(2)
  resources[0].B25__Api_Visible__c = true
  resources[0].B25__Capacity__c = 20
  resources[1].B25__Api_Visible__c = false
  resources[1].B25__Capacity__c = 30
  fetchMock.doMock(JSON.stringify(resources))

  const result = await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .withCondition(new Condition('B25__Api_Visible__c', Operator.EQUAL, true))
    .withCondition(new Condition('B25__Capacity__c', Operator.GREATER_THAN, 25))
    .getResults()

  expect(result.numberOfresources()).toBe(2)
})
