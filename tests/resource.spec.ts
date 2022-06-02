import Resource from '../src/resource'
import { ResourceGenerator } from './__utils__/resource-responses'

test('The values are loaded from the parsed json', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resource = new Resource(resourceGenerator.getSimpleResource())
  expect(resource.id).toBe('Id 1')
  expect(resource.name).toBe('Name 1')
})
