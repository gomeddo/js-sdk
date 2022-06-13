import ResourceType from '../src/s-objects/resource-type'
import { ResourceGenerator } from './__utils__/resource-responses'

test('The basic values are loaded from the parsed json', () => {
  const resourceGenerator = new ResourceGenerator('Id', 'Name')
  const resource = new ResourceType(resourceGenerator.getResourceType(1))
  expect(resource.id).toBe('Type Id 1')
  expect(resource.name).toBe('Type Name 1')
})
