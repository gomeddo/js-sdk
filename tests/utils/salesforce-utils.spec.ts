import { validateSalesforceId } from '../../src/utils/salesforce-utils'
import { dummyId0, dummyId1, dummyId2, dummyId3, dummyId4, dummyId5, dummyId6, dummyId7, dummyId8, dummyId9 } from '../__utils__/salesforce-dummy-ids'

test('Allows through correct salesforce ids', () => {
  expect(() => validateSalesforceId(dummyId0)).not.toThrow()
  expect(() => validateSalesforceId(dummyId1)).not.toThrow()
  expect(() => validateSalesforceId(dummyId2)).not.toThrow()
  expect(() => validateSalesforceId(dummyId3)).not.toThrow()
  expect(() => validateSalesforceId(dummyId4)).not.toThrow()
  expect(() => validateSalesforceId(dummyId5)).not.toThrow()
  expect(() => validateSalesforceId(dummyId6)).not.toThrow()
  expect(() => validateSalesforceId(dummyId7)).not.toThrow()
  expect(() => validateSalesforceId(dummyId8)).not.toThrow()
  expect(() => validateSalesforceId(dummyId9)).not.toThrow()
})
