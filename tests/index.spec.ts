import Booker25 from '../src/index'

test('Booker25 has a version number', () => {
  expect(Booker25.version).toMatch(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)
})
