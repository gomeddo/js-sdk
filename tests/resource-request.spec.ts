import { Enviroment } from '../src/index'
import Booker25API from '../src/api/booker25-api-requests'
import ResourceRequest from '../src/resource-request'
import { ResourceGenerator } from './__utils__/resource-responses'
import { getAvailabilityResponse, getAvailabilitySlot, getServiceResponse, getServiceSlot } from './__utils__/availability-responses'
import AvailabilityTimeSlotRequest from '../src/api/availability-request'
import { AvailabilitySlotType } from '../src/time-slots/availability-time-slot'
import ServiceTimeSlotRequest from '../src/api/service-availability-request'

const baseResourceRequestUrl = 'https://api.booker25.com/api/v3/proxy/resources'
const availabilityRequestUrl = 'https://api.booker25.com/api/v3/proxy/availability'
const serviceRequestUrl = 'https://api.booker25.com/api/v3/proxy/serviceAvailability'
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
      getAvailabilityResponse(['Id 1'], [
        getAvailabilitySlot(1, 0, 1, 8, 'Closed'),
        getAvailabilitySlot(1, 8, 1, 16, 'Open'),
        getAvailabilitySlot(1, 16, 2, 0, 'Closed'),
        getAvailabilitySlot(1, 6, 1, 12, 'Reservation')
      ])[0],
      getAvailabilityResponse(['Id 2'], [
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
  const resourceOne = result.getResourceById('Id 1')
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
  const resourceTwo = result.getResourceById('Id 2')
  expect(resourceTwo).toBeUndefined()
})

test('It adds service timelines if requested', async () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceFetchMock = fetchMock.once(JSON.stringify(resourceGenerator.getResourceArray(2)))
  const availabilityFetchMock = fetchMock.once(JSON.stringify(getAvailabilityResponse(['Id 1', 'Id 2'], [
    getAvailabilitySlot(1, 0, 2, 0, 'Open')
  ])))
  const serviceAvailabilityFetchMock = fetchMock.once(JSON.stringify(
    [
      getServiceResponse(['Id 1'], ['Service Id 1', 'Service Id 2'], [
        getServiceSlot(1, 0, 2, 0, 'Availability', 10),
        getServiceSlot(1, 10, 1, 16, 'Reservation', 5)
      ])[0],
      getServiceResponse(['Id 2'], ['Service Id 1'], [])[0]
    ]
  ))

  const result = await new ResourceRequest(new Booker25API(Enviroment.PRODUCTION))
    .withAvailableSlotsBetween(new Date(Date.UTC(2022, 0, 1)), new Date(Date.UTC(2022, 0, 2)))
    .includeServices(true)
    .getResults()
  // Clear the first two mock calls
  expect(resourceFetchMock).toBeCalled()
  expect(availabilityFetchMock).toBeCalled()
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
  const resourceOne = result.getResourceById('Id 1')
  expect(resourceOne).not.toBeUndefined()
  expect(resourceOne?.getAvailableServices().length).toBe(2)
  const serviceOne = resourceOne?.getServiceById('Service Id 1')
  expect(serviceOne?.timeSlots[0].remainingQuantity).toBe(10)
  expect(serviceOne?.timeSlots[0].startOfSlot).toBe('2022-01-01T00:00:00.000Z')
  expect(serviceOne?.timeSlots[0].endOfSlot).toBe('2022-01-01T10:00:00.000Z')
  expect(serviceOne?.timeSlots[1].remainingQuantity).toBe(5)
  expect(serviceOne?.timeSlots[1].startOfSlot).toBe('2022-01-01T10:00:00.000Z')
  expect(serviceOne?.timeSlots[1].endOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(serviceOne?.timeSlots[2].remainingQuantity).toBe(10)
  expect(serviceOne?.timeSlots[2].startOfSlot).toBe('2022-01-01T16:00:00.000Z')
  expect(serviceOne?.timeSlots[2].endOfSlot).toBe('2022-01-02T00:00:00.000Z')
  const serviceTwo = resourceOne?.getServiceById('Service Id 2')
  expect(serviceTwo).not.toBeUndefined()

  const resourceTwo = result.getResourceById('Id 2')
  const serviceOneOnResourceTwo = resourceTwo?.getServiceById('Service Id 1')
  expect(serviceOneOnResourceTwo).not.toBeUndefined()
  const serviceTwoOnResourceTwo = resourceTwo?.getServiceById('Service Id 2')
  expect(serviceTwoOnResourceTwo).toBeUndefined()
})
