import Booker25 from '../src/index'

test('Booker25 has a version number', () => {
  const booker25 = new Booker25()
  expect(booker25.version).toBe('0.0.1')
})
