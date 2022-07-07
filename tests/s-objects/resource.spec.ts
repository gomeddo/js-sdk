import Resource from '../../src/s-objects/resource'
import { ResourceGenerator } from '../__utils__/resource-responses'

test('The basic values are loaded from the parsed json', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resource = new Resource(resourceGenerator.getResource())
  expect(resource.id).toBe('Id 1')
  expect(resource.name).toBe('Name 1')
})

test('The resource type is populated based on the parsed json', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resource = new Resource(resourceGenerator.getResourceOfType(1))
  expect(resource.id).toBe('Id 1')
  expect(resource.name).toBe('Name 1')
  expect(resource.resourceType.name).toBe('Type Name 1')
  expect(resource.resourceType.id).toBe('Type Id 1')
})

test('Custom properties are loaded and can be accessed', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const parsedResourceJSON = resourceGenerator.getResource()
  parsedResourceJSON.Is_Wheelchair_Accessible__c = true
  const resource = new Resource(parsedResourceJSON)
  expect(resource.getCustomProperty('Is_Wheelchair_Accessible__c')).toBe(true)
})

test('Standard properties are not custom properties', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const parsedResourceJSON = resourceGenerator.getResource()
  const resource = new Resource(parsedResourceJSON)
  expect(resource.getCustomProperty('Id')).toBeUndefined()
  expect(resource.getCustomProperty('Name')).toBeUndefined()
  expect(resource.getCustomProperty('B25__Resource_Type__c')).toBeUndefined()
  expect(resource.getCustomProperty('B25__Resource_Type__r')).toBeUndefined()
})
