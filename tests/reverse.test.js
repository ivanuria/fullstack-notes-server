const { describe, test } = require('node:test')
const assert = require('node:assert')

const reverse = require('../utils/for_testing').reverse

describe('reverse', () => {
  test('of a', () => {
    const result = reverse('a')

    assert.strictEqual(result, 'a')
  })

  test('of react', () => {
    const result = reverse('react')

    assert.strictEqual(result, 'tcaer')
  })

  test('of saippuakauppias', () => {
    const result = reverse('saippuakauppias')

    assert.strictEqual(result, 'saippuakauppias')
  })
})