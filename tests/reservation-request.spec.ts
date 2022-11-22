import { FetchMock } from 'jest-fetch-mock/types'
import { AndCondition, Condition, Contact, Environment, Lead, Operator, OrCondition, ReservationRequest, Resource } from '../src'
import Booker25API from '../src/api/booker25-api-requests'
import { APIConditionElement } from '../src/api/request-bodies/api-condition'
import ReservationSearchBody from '../src/api/request-bodies/reservation-search-body'
import { JoinCondition } from '../src/filters/conditions'
import { dummyId0, dummyId1 } from './__utils__/salesforce-dummy-ids'

const baseResourceSearchUrl = 'https://api.booker25.com/api/v3/proxy/B25/v1/reservations/search'
const getReservationRequest = (): ReservationRequest => new ReservationRequest(new Booker25API('key', Environment.PRODUCTION))
const getExpectedBody = (reservationIds: string[], rangeStart: Date | null, rangeEnd: Date | null, condition: APIConditionElement | undefined): String => {
  return JSON.stringify(new ReservationSearchBody(reservationIds, rangeStart, rangeEnd, condition))
}
let mock: FetchMock = fetchMock.once('[]')

beforeEach(() => {
  fetchMock.resetMocks()
  mock = fetchMock.once('[]')
})

test('It refuses to search reservations when no filters are applied', async () => {
  const reservationRequest = getReservationRequest()
  await expect(reservationRequest.getResults()).rejects.toEqual(new Error('A reservation request has to have at least one filter applied'))
})

test('It sends the correct request if reservation Ids are provided.', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withIds(dummyId0, dummyId1).getResults()
  expectMockSearchMockToHaveBeenCalledWith(mock, [dummyId0, dummyId1], null, null, undefined, [])
})

test('It sends the correct request if rangeStart is provided.', async () => {
  const reservationRequest = getReservationRequest()
  const datetime = new Date()
  await reservationRequest.onlyReservationsAfter(datetime).getResults()
  expectMockSearchMockToHaveBeenCalledWith(mock, [], datetime, null, undefined, [])
})

test('It sends the correct request if rangeEnd is provided.', async () => {
  const reservationRequest = getReservationRequest()
  const datetime = new Date()
  await reservationRequest.onlyReservationsBefore(datetime).getResults()
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, datetime, undefined, [])
})

test('It adds a field to the url', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withIds(dummyId0).withAdditionalField('B25__Notes__c').getResults()
  expectMockSearchMockToHaveBeenCalledWith(mock, [dummyId0], null, null, undefined, ['B25__Notes__c'])
})

test('It adds a fields to the url', async () => {
  const reservationRequest = getReservationRequest()
  const mock = fetchMock.once('[]')
  await reservationRequest.withIds(dummyId0).withAdditionalFields(new Set(['B25__Notes__c', 'B25__Start__c'])).getResults()
  expectMockSearchMockToHaveBeenCalledWith(mock, [dummyId0], null, null, undefined, ['B25__Notes__c', 'B25__Start__c'])
})

test('It sends the correct request if liked to contact with an id is provided.', async () => {
  const reservationRequest = getReservationRequest()
  const contact = new Contact('test', 'booker25', 'example@example.com')
  contact.id = dummyId0
  await reservationRequest.linkedToContact(contact).getResults()
  const expectedCondition = new AndCondition([])
  expectedCondition.conditions.push(new Condition('B25__Contact__c', Operator.EQUAL, dummyId0))
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if liked to contact without an id is provided.', async () => {
  const reservationRequest = getReservationRequest()
  const contact = new Contact('test', 'booker25', 'example@example.com')
  await reservationRequest.linkedToContact(contact).getResults()
  const contactCondition = new AndCondition([])
  contactCondition.conditions.push(new Condition('B25__Contact__r.FirstName', Operator.EQUAL, 'test'))
  contactCondition.conditions.push(new Condition('B25__Contact__r.LastName', Operator.EQUAL, 'booker25'))
  contactCondition.conditions.push(new Condition('B25__Contact__r.Email', Operator.EQUAL, 'example@example.com'))
  const expectedCondition = new AndCondition([contactCondition])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if liked to lead with an id is provided.', async () => {
  const reservationRequest = getReservationRequest()
  const lead = new Lead('test', 'booker25', 'example@example.com')
  lead.id = dummyId0
  await reservationRequest.linkedToLead(lead).getResults()
  const expectedCondition = new AndCondition([])
  expectedCondition.conditions.push(new Condition('B25__Lead__c', Operator.EQUAL, dummyId0))
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if liked to lead without an id is provided.', async () => {
  const reservationRequest = getReservationRequest()
  const lead = new Lead('test', 'booker25', 'example@example.com')
  await reservationRequest.linkedToLead(lead).getResults()
  const leadCondition = new AndCondition([])
  leadCondition.conditions.push(new Condition('B25__Lead__r.FirstName', Operator.EQUAL, 'test'))
  leadCondition.conditions.push(new Condition('B25__Lead__r.LastName', Operator.EQUAL, 'booker25'))
  leadCondition.conditions.push(new Condition('B25__Lead__r.Email', Operator.EQUAL, 'example@example.com'))
  const expectedCondition = new AndCondition([leadCondition])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if liked to resource with an id is provided.', async () => {
  const reservationRequest = getReservationRequest()
  const mock = fetchMock.once('[]')
  const resource = new Resource({
    Id: dummyId0,
    Name: 'Test Resource'
  })
  await reservationRequest.linkedToResource(resource).getResults()
  const expectedCondition = new AndCondition([])
  expectedCondition.conditions.push(new Condition('B25__Resource__c', Operator.EQUAL, dummyId0))
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if liked to resource without an id is provided.', async () => {
  const reservationRequest = getReservationRequest()
  const resource = new Resource({
    Id: dummyId0,
    Name: 'Test Resource'
  })
  resource.id = ''
  resource.setCustomProperty('Id', undefined)
  await reservationRequest.linkedToResource(resource).getResults()
  const resourceCondition = new AndCondition([])
  resourceCondition.conditions.push(new Condition('B25__Resource__r.Name', Operator.EQUAL, 'Test Resource'))
  const expectedCondition = new AndCondition([resourceCondition])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if a type id is provided', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withType(dummyId0).getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Reservation_Type__c', Operator.IN, [dummyId0]))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if type ids are provided', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withType(dummyId0, dummyId1).getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Reservation_Type__c', Operator.IN, [dummyId0, dummyId1]))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if a type name is provided', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withType('Reservation').getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Reservation_Type__r.Name', Operator.IN, ['Reservation']))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if type names are provided', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withType('Reservation', 'Event').getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Reservation_Type__r.Name', Operator.IN, ['Reservation', 'Event']))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if type names and ids are mixed', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withType('Reservation', dummyId0, 'Event', dummyId1).getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Reservation_Type__c', Operator.IN, [dummyId0, dummyId1]))
  innerOr.conditions.push(new Condition('B25__Reservation_Type__r.Name', Operator.IN, ['Reservation', 'Event']))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if a status id is provided', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withStatus(dummyId0).getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Status__c', Operator.IN, [dummyId0]))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if status ids are provided', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withStatus(dummyId0, dummyId1).getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Status__c', Operator.IN, [dummyId0, dummyId1]))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if a status name is provided', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withStatus('Completed').getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Status__r.Name', Operator.IN, ['Completed']))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if status names are provided', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withStatus('Completed', 'Canceled').getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Status__r.Name', Operator.IN, ['Completed', 'Canceled']))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if status names and ids are mixed', async () => {
  const reservationRequest = getReservationRequest()
  await reservationRequest.withStatus('Completed', dummyId0, 'Canceled', dummyId1).getResults()
  const innerOr = new OrCondition([])
  innerOr.conditions.push(new Condition('B25__Status__c', Operator.IN, [dummyId0, dummyId1]))
  innerOr.conditions.push(new Condition('B25__Status__r.Name', Operator.IN, ['Completed', 'Canceled']))
  const expectedCondition = new AndCondition([innerOr])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if reservation contacts condition is added', async () => {
  const reservationRequest = getReservationRequest()
  const contact = new Contact('test', 'booker25', 'example@example.com')
  reservationRequest.linkedToReservationContacts().linkedToContact(contact)
  await reservationRequest.getResults()
  const contactCondition = new AndCondition([])
  contactCondition.conditions.push(new Condition('B25__Contact_Lookup__r.FirstName', Operator.EQUAL, 'test'))
  contactCondition.conditions.push(new Condition('B25__Contact_Lookup__r.LastName', Operator.EQUAL, 'booker25'))
  contactCondition.conditions.push(new Condition('B25__Contact_Lookup__r.Email', Operator.EQUAL, 'example@example.com'))
  const expectedCondition = new AndCondition([new JoinCondition('Id', Operator.IN, 'B25__ReservationContact__c', 'B25__Reservation_Lookup__c', new AndCondition([contactCondition]))])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

test('It sends the correct request if reservation contacts condition with Id is added', async () => {
  const reservationRequest = getReservationRequest()
  const contact = new Contact('test', 'booker25', 'example@example.com')
  contact.id = dummyId0
  reservationRequest.linkedToReservationContacts().linkedToContact(contact)
  await reservationRequest.getResults()
  const contactCondition = new AndCondition([])
  contactCondition.conditions.push(new Condition('B25__Contact_Lookup__c', Operator.EQUAL, dummyId0))
  const expectedCondition = new AndCondition([new JoinCondition('Id', Operator.IN, 'B25__ReservationContact__c', 'B25__Reservation_Lookup__c', contactCondition)])
  expectMockSearchMockToHaveBeenCalledWith(mock, [], null, null, expectedCondition.getAPICondition(), [])
})

const expectMockSearchMockToHaveBeenCalledWith = (mock: FetchMock, reservationIds: string[], rangeStart: Date | null, rangeEnd: Date | null, condition: APIConditionElement | undefined, fields: string[]): void => {
  const expectedUrl = `${baseResourceSearchUrl}?fields=Id${fields.length !== 0 ? '%2C' : ''}${fields.join('%2C')}`
  expect(mock).toBeCalledWith(expectedUrl,
    {
      method: 'POST',
      body: getExpectedBody(reservationIds, rangeStart, rangeEnd, condition),
      headers: { Authorization: 'Bearer key' }
    }
  )
}
