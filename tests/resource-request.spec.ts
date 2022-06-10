import { Enviroment } from '../src/index'
import Booker25API from '../src/booker25-api-requests'
import ResourceRequest from '../src/resource-request'
import { ResourceGenerator } from './__utils__/resource-responses'
import { getResponse, getSlot } from './__utils__/availability-responses'
import { AvailabilityTimeslotsRequestBody, SlotType } from '../src/availability-timeslots'

const baseResourceRequestUrl = 'https://api.booker25.com/api/v3/proxy/resources'
const availabilityRequestUrl = 'https://api.booker25.com/api/v3/proxy/availability'
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
  expect(result.getResourceById('Id 1')).not.toBeUndefined()
  expect(result.getResourceById('Id 2')).not.toBeUndefined()
})

test('It adds timelines if requested', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.once(JSON.stringify(
    resourceGenerator.getResourceArray(2)
  ))
  const availabilityFetchMock = fetchMock.once(JSON.stringify(
    [
      getResponse(['Id 1'], [
        getSlot(1, 0, 1, 8, 'Closed'),
        getSlot(1, 8, 1, 16, 'Open'),
        getSlot(1, 16, 2, 0, 'Closed'),
        getSlot(1, 6, 1, 12, 'Reservation')
      ])[0],
      getResponse(['Id 2'], [
        getSlot(1, 0, 2, 0, 'Closed')
      ])[0]
    ]
  ))
  const result = await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .withAvailableSlotsBetween(new Date(Date.UTC(2022, 0, 1)), new Date(Date.UTC(2022, 0, 2)))
    .getResults()
  expect(resourceFetchMock).toBeCalledWith(`${baseResourceRequestUrl}?fields=Id%2CName%2CB25__Resource_Type__c%2CB25__Parent__c`)
  const requestBody = new AvailabilityTimeslotsRequestBody(
    new Date(Date.UTC(2022, 0, 1)),
    new Date(Date.UTC(2022, 0, 2)),
    ['Id 1', 'Id 2']
  )
  expect(availabilityFetchMock).toBeCalledWith(availabilityRequestUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  })
  expect(result.numberOfresources()).toBe(1)
  const resourceOne = result.getResourceById('Id 1')
  expect(resourceOne).not.toBeUndefined()
  expect(resourceOne?.getTimeslots().length).toBe(4)
  expect(resourceOne?.getTimeslots()[0].type).toBe(SlotType.CLOSED)
  expect(resourceOne?.getTimeslots()[0].startOfSlot).toBe('2022-01-01T00:00:00.000Z')
  expect(resourceOne?.getTimeslots()[0].endOfSlot).toBe('2022-01-01T08:00:00.000Z')
  expect(resourceOne?.getTimeslots()[1].type).toBe(SlotType.RESERVATION)
  expect(resourceOne?.getTimeslots()[1].startOfSlot).toBe('2022-01-01T08:00:00.000Z')
  expect(resourceOne?.getTimeslots()[1].endOfSlot).toBe('2022-01-01T12:00:00.000Z')
  expect(resourceOne?.getTimeslots()[2].type).toBe(SlotType.OPEN)
  expect(resourceOne?.getTimeslots()[2].startOfSlot).toBe('2022-01-01T12:00:00.000Z')
  expect(resourceOne?.getTimeslots()[2].endOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(resourceOne?.getTimeslots()[3].type).toBe(SlotType.CLOSED)
  expect(resourceOne?.getTimeslots()[3].startOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(resourceOne?.getTimeslots()[3].endOfSlot).toBe('2022-01-02T00:00:00.000Z')

  // Fully closed so should be filtered out
  const resourceTwo = result.getResourceById('Id 2')
  expect(resourceTwo).toBeUndefined()
})
