import { validateSalesforceId } from '../../src/utils/salesforce-utils'

test('Allows through correct salesforce ids', () => {
  expect(() => validateSalesforceId('a0i1j000006uxAmAAI')).not.toThrow()
  expect(() => validateSalesforceId('a0i1j000006uxBQAAY')).not.toThrow()
  expect(() => validateSalesforceId('a0i1j000006uxGcAAI')).not.toThrow()
  expect(() => validateSalesforceId('a0i1j000006uxbJAAQ')).not.toThrow()
  expect(() => validateSalesforceId('a0c1j000003kyYdAAI')).not.toThrow()
  expect(() => validateSalesforceId('0031j00001M1z58AAB')).not.toThrow()
  expect(() => validateSalesforceId('0011j00001PHt6MAAT')).not.toThrow()
  expect(() => validateSalesforceId('0011j00001OjFjVAAV')).not.toThrow()
  expect(() => validateSalesforceId('0051j00000AhgOUAAZ')).not.toThrow()
  expect(() => validateSalesforceId('0051j00000AipAyAAJ')).not.toThrow()
  expect(() => validateSalesforceId('0051j00000AhgOaAAJ')).not.toThrow()
})
