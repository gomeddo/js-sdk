import { Enviroment } from '../src/index'
import Booker25API from '../src/booker25-api-requests'
import ResourceRequest from '../src/resource-request'
import { ResourceGenerator } from './__utils__/resource-responses'

const baseResourceRequestUrl = 'https://api.booker25.com/api/v3/proxy/resources'
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
