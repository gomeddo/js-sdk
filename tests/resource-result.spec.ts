import ResourceResult from '../src/resource-result'
import { ResourceGenerator } from './__utils__/resource-responses'

test('It generates a resource object for each resource passed', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceResult = new ResourceResult(resourceGenerator.getResourceArray(2))
  expect(resourceResult.numberOfresources()).toBe(2)
  expect(resourceResult.getResourceById('Id 1')).not.toBeUndefined()
  expect(resourceResult.getResourceById('Id 2')).not.toBeUndefined()
})

test('getResource returns the correct resource by id', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resourceResult = new ResourceResult(resourceGenerator.getResourceArray(2))
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
  const resourceResult = new ResourceResult(resourceGenerator.getResourceArray(2))
  expect(resourceResult.numberOfresources()).toBe(2)
  const resourceOne = resourceResult.getResourceByName('Name 1')
  expect(resourceOne?.id).toBe('Id 1')
  expect(resourceOne?.name).toBe('Name 1')
  const resourceTwo = resourceResult.getResourceByName('Name 2')
  expect(resourceTwo?.id).toBe('Id 2')
  expect(resourceTwo?.name).toBe('Name 2')
  expect(resourceResult.getResourceByName('Name 3')).toBeUndefined()
})

test('Parent is set correctly', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const parsedResourceJSON = [resourceGenerator.getResource(), resourceGenerator.getResourceWithParent(1)]
  const resourceResult = new ResourceResult(parsedResourceJSON).computeTreeStructure()
  const resourceOne = resourceResult.getResourceById('Id 1')
  const resourceTwo = resourceResult.getResourceById('Id 2')
  expect(resourceOne?.parent).toBeNull()
  expect(resourceTwo?.parent).toStrictEqual(resourceOne)
})

test('children is set correctly', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const parsedResourceJSON = [resourceGenerator.getResource(), resourceGenerator.getResourceWithParent(1)]
  const resourceResult = new ResourceResult(parsedResourceJSON).computeTreeStructure()
  const resourceOne = resourceResult.getResourceById('Id 1')
  const resourceTwo = resourceResult.getResourceById('Id 2')
  expect(resourceOne?.children).toStrictEqual([resourceTwo])
})

test('Parent is set correctly with a gap in the tree', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  // very simple tree 1-->2-->3-->4
  const resourceOneParsedJSON = resourceGenerator.getResource()
  resourceGenerator.getResourceWithParent(1)
  const resourceThreeParsedJSON = resourceGenerator.getResourceWithParent(2)
  const resourceFourParsedJSON = resourceGenerator.getResourceWithParent(3)
  // Some sort of condition causes resourceTwo to not be included
  const parsedResourceJSON = [resourceOneParsedJSON, resourceThreeParsedJSON, resourceFourParsedJSON]
  const resourceResult = new ResourceResult(parsedResourceJSON).computeTreeStructure()
  const resourceOne = resourceResult.getResourceById('Id 1')
  const resourceTwo = resourceResult.getResourceById('Id 2')
  const resourceThree = resourceResult.getResourceById('Id 3')
  const resourceFour = resourceResult.getResourceById('Id 4')
  expect(resourceOne).not.toBeUndefined()
  expect(resourceTwo).toBeUndefined()
  expect(resourceThree).not.toBeUndefined()
  expect(resourceFour).not.toBeUndefined()
  expect(resourceOne?.parent).toBeNull()
  expect(resourceThree?.parent).toBeNull()
  expect(resourceFour?.parent).toStrictEqual(resourceThree)
})

test('Children is set correctly with a gap in the tree', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  // very simple tree 1-->2-->3-->4
  const resourceOneParsedJSON = resourceGenerator.getResource()
  resourceGenerator.getResourceWithParent(1)
  const resourceThreeParsedJSON = resourceGenerator.getResourceWithParent(2)
  const resourceFourParsedJSON = resourceGenerator.getResourceWithParent(3)
  // Some sort of condition causes resourceTwo to not be included
  const parsedResourceJSON = [resourceOneParsedJSON, resourceThreeParsedJSON, resourceFourParsedJSON]
  const resourceResult = new ResourceResult(parsedResourceJSON).computeTreeStructure()
  const resourceOne = resourceResult.getResourceById('Id 1')
  const resourceTwo = resourceResult.getResourceById('Id 2')
  const resourceThree = resourceResult.getResourceById('Id 3')
  const resourceFour = resourceResult.getResourceById('Id 4')
  expect(resourceOne).not.toBeUndefined()
  expect(resourceTwo).toBeUndefined()
  expect(resourceThree).not.toBeUndefined()
  expect(resourceFour).not.toBeUndefined()
  expect(resourceOne?.children).toStrictEqual([])
  expect(resourceThree?.children).toStrictEqual([resourceFour])
  expect(resourceFour?.children).toStrictEqual([])
})
