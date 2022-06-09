import Contact from '../src/contact'

test('properties are set based on the constructor', () => {
  const contact = new Contact('firstname', 'lastname', 'email')
  expect(contact.getCustomProperty('FirstName')).toBe('firstname')
  expect(contact.getCustomProperty('LastName')).toBe('lastname')
  expect(contact.getCustomProperty('Email')).toBe('email')
})
