import { cartesianProductOf } from '../../src/utils/array-utils'

test('It generates a cartesian product', () => {
  expect(cartesianProductOf(['a', 'b'], ['1', '2'])).toStrictEqual([['a', '1'], ['a', '2'], ['b', '1'], ['b', '2']])
})
