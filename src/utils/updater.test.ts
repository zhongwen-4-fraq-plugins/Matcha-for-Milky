import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const checkMock = vi.hoisted(() => vi.fn())

vi.mock('@tauri-apps/plugin-updater', () => ({
  check: checkMock,
}))

import { checkForUpdate } from './updater'

describe('checkForUpdate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    checkMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns immediately when the first check succeeds', async () => {
    const update = { available: false }
    checkMock.mockResolvedValue(update)

    await expect(checkForUpdate()).resolves.toBe(update)
    expect(checkMock).toHaveBeenCalledTimes(1)
  })

  it('retries a temporary request failure', async () => {
    const update = { available: false }
    checkMock.mockRejectedValueOnce(new Error('network error')).mockResolvedValueOnce(update)

    const result = checkForUpdate()
    await vi.runAllTimersAsync()

    await expect(result).resolves.toBe(update)
    expect(checkMock).toHaveBeenCalledTimes(2)
  })

  it('throws after three failed checks', async () => {
    const error = new Error('network error')
    checkMock.mockRejectedValue(error)

    const result = checkForUpdate()
    const rejection = expect(result).rejects.toBe(error)
    await vi.runAllTimersAsync()

    await rejection
    expect(checkMock).toHaveBeenCalledTimes(3)
  })
})
