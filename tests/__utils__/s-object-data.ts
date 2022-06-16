import { CustomSFSObject } from '../../src/s-objects/s-object'
import { dummyId0 } from './salesforce-dummy-ids'

const getSObject = (id = dummyId0, name = 'SObject Name'): CustomSFSObject => {
  return {
    Id: id,
    Name: name
  }
}
export {
  getSObject
}
