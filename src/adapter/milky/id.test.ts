import { describe, expect, it } from 'vitest'

import { toMilkyId } from './id'

describe('Milky ID conversion', () => {
  it('converts a numeric string to an integer', () => {
    expect(toMilkyId((1_0000).toString())).toBe(1_0000)
  })

  it.each(['test-user', '', '0', Number.NaN])('rejects an invalid ID: %s', (value) => {
    expect(() => toMilkyId(value)).toThrow('Milky ID 必须是正整数')
  })
})
