import ResourceResult from '../src/resource-result'
import { ResourceGenerator } from './__utils__/resource-responses'

test('It generates a resource object for each resource passed', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceResult = new ResourceResult(resourceGenerator.getSimpleResourceArray(2))
  expect(resourceResult.numberOfresources()).toBe(2)
  expect(resourceResult.getResourceById('Id 1')).not.toBeUndefined()
  expect(resourceResult.getResourceById('Id 2')).not.toBeUndefined()
})

test('getResource returns the correct resource by id', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceResult = new ResourceResult(resourceGenerator.getSimpleResourceArray(2))
  expect(resourceResult.numberOfresources()).toBe(2)
  const resourceOne = resourceResult.getResourceById('Id 1')
  expect(resourceOne?.id).toBe('Id 1')
  expect(resourceOne?.name).toBe('Name 1')
  const resourceTwo = resourceResult.getResourceById('Id 2')
  expect(resourceTwo?.id).toBe('Id 2')
  expect(resourceTwo?.name).toBe('Name 2')
  expect(resourceResult.getResourceById('Id 3')).toBeUndefined()
})

test('getResource returns the correct resource by name', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceResult = new ResourceResult(resourceGenerator.getSimpleResourceArray(2))
  expect(resourceResult.numberOfresources()).toBe(2)
  const resourceOne = resourceResult.getResourceByName('Name 1')
  expect(resourceOne?.id).toBe('Id 1')
  expect(resourceOne?.name).toBe('Name 1')
  const resourceTwo = resourceResult.getResourceByName('Name 2')
  expect(resourceTwo?.id).toBe('Id 2')
  expect(resourceTwo?.name).toBe('Name 2')
  expect(resourceResult.getResourceByName('Name 3')).toBeUndefined()
})
