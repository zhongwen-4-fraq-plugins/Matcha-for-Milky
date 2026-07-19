import { describe, expect, it, vi } from 'vitest'

import { registerGroupFiles } from './group-file'

describe('group file registration', () => {
  it('stores each message file under its group and folder', async () => {
    const put = vi.fn(async () => 'key')
    vi.stubGlobal('db', { groupFiles: { put } })
    vi.stubGlobal('getTimestamp', () => 17_0000_0000)

    await registerGroupFiles('20000', '30000', ['file', 'file'])

    expect(put).toHaveBeenCalledTimes(1)
    expect(put).toHaveBeenCalledWith({
      groupId: '20000',
      fileId: 'file',
      parentFolderId: '/',
      uploadedTime: 17_0000_0000,
      uploaderId: '30000',
      downloadedTimes: 0,
    })
  })
})
