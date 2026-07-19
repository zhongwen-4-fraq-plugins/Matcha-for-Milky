import { describe, expect, it } from 'vitest'

import { getBotLifecycleAction } from './bot-lifecycle'

describe('bot connection lifecycle', () => {
  it('starts and stops with bot availability', () => {
    expect(getBotLifecycleAction(undefined, '10000')).toBe('startup')
    expect(getBotLifecycleAction('10000')).toBe('shutdown')
  })

  it('keeps the existing connection when exchanging accounts', () => {
    expect(getBotLifecycleAction('10000', '20000')).toBeUndefined()
  })
})
