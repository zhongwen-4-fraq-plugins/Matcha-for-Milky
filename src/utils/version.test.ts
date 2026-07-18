import { describe, expect, it } from 'vitest'

import { formatDateVersion, formatReleaseVersion } from './version'

describe('date version formatting', () => {
  it('formats YY.M.DDNN as YYYYMMDDNN', () => {
    expect(formatDateVersion('25.7.1802')).toBe('2025071802')
    expect(formatDateVersion('26.12.3109')).toBe('2026123109')
  })

  it('adds the release channel to date versions', () => {
    expect(formatReleaseVersion('25.7.1802')).toBe('2025071802-build')
  })

  it('preserves versions from the previous scheme', () => {
    expect(formatDateVersion('0.4.10')).toBe('0.4.10')
    expect(formatReleaseVersion('0.4.10')).toBe('0.4.10')
  })
})
