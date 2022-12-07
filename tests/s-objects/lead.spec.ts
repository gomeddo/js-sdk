import { Lead } from '../../src/index'

test('properties are set based on the constructor', () => {
  const lead = new Lead('firstname', 'lastname', 'email')
  expect(lead.getCustomProperty('FirstName')).toBe('firstname')
  expect(lead.getCustomProperty('LastName')).toBe('lastname')
  expect(lead.getCustomProperty('Email')).toBe('email')
})
