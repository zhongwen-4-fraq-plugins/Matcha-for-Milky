/* eslint-disable camelcase */
import { Behav } from '~/adapter/behav'
import { createFileCache, getFile, GetType } from '~/utils/file'

import { failure, response } from '../typed'

import type { ActionStrategy } from '~/adapter/action'

async function groupFolderExists(groupId: string, folderId: string): Promise<boolean> {
  return folderId === '/' || !!(await db.groupFolders.get([groupId, folderId]))
}

async function canUseGroupFiles(groupId: string): Promise<boolean> {
  return await roleCheck('member', groupId, useStateStore().bot!.id)
}

export const fileActions: ActionStrategy = {
  upload_private_file: async ({
    user_id,
    file_uri,
    file_name,
  }: {
    user_id: number
    file_uri: string
    file_name: string
  }) => {
    if (!(await db.users.get(user_id.toString()))) {
      return failure(-404, `用户 ${user_id} 不存在`)
    }
    const file = await createFileCache(file_uri, undefined, file_name)
    await db.privateFiles.put({ userId: user_id.toString(), fileId: file.id })
    const cachedFile = await db.files.get(file.id)
    await new Behav().uploadPrivateFile(user_id.toString(), {
      id: file.id,
      name: file_name,
      size: cachedFile?.size ?? 0,
    })
    return response({ file_id: file.id })
  },
  upload_group_file: async ({
    group_id,
    parent_folder_id = '/',
    file_uri,
    file_name,
  }: {
    group_id: number
    parent_folder_id?: string
    file_uri: string
    file_name: string
  }) => {
    const groupId = group_id.toString()
    if (!(await canUseGroupFiles(groupId))) {
      return failure(-403, '机器人不是群成员')
    }
    if (!(await groupFolderExists(groupId, parent_folder_id))) {
      return failure(-404, `群文件夹 ${parent_folder_id} 不存在`)
    }
    const file = await createFileCache(file_uri, undefined, file_name)
    await db.groupFiles.put({
      groupId,
      fileId: file.id,
      parentFolderId: parent_folder_id,
      uploadedTime: getTimestamp(),
      uploaderId: useStateStore().bot!.id,
      downloadedTimes: 0,
    })
    const cachedFile = await db.files.get(file.id)
    await new Behav().uploadGroupFile(groupId, {
      id: file.id,
      name: file_name,
      size: cachedFile?.size ?? 0,
    })
    return response({ file_id: file.id })
  },
  get_private_file_download_url: async ({ user_id, file_id }: { user_id: number, file_id: string }) => {
    if (!(await db.privateFiles.get([user_id.toString(), file_id]))) {
      return failure(-404, `私聊文件 ${file_id} 不存在`)
    }
    return response({ download_url: await getFile(GetType.URL, file_id) })
  },
  get_group_file_download_url: async ({ group_id, file_id }: { group_id: number, file_id: string }) => {
    const groupFile = await db.groupFiles.get([group_id.toString(), file_id])
    if (!groupFile) {
      return failure(-404, `群文件 ${file_id} 不存在`)
    }
    await db.groupFiles.update([groupFile.groupId, file_id], { downloadedTimes: groupFile.downloadedTimes + 1 })
    return response({ download_url: await getFile(GetType.URL, file_id) })
  },
  get_group_files: async ({ group_id, parent_folder_id = '/' }: { group_id: number, parent_folder_id?: string }) => {
    const groupId = group_id.toString()
    if (!(await groupFolderExists(groupId, parent_folder_id))) {
      return failure(-404, `群文件夹 ${parent_folder_id} 不存在`)
    }
    const storedFiles = await db.groupFiles.where({ groupId, parentFolderId: parent_folder_id }).toArray()
    const storedFolders = await db.groupFolders.where({ groupId, parentFolderId: parent_folder_id }).toArray()
    const files = await Promise.all(storedFiles.map(async (groupFile) => {
      const file = await db.files.get(groupFile.fileId)
      return file && {
        group_id,
        file_id: file.id,
        file_name: file.name,
        parent_folder_id: groupFile.parentFolderId,
        file_size: file.size,
        uploaded_time: groupFile.uploadedTime,
        uploader_id: Number(groupFile.uploaderId),
        downloaded_times: groupFile.downloadedTimes,
      }
    }))
    const folders = await Promise.all(storedFolders.map(async folder => ({
      group_id,
      folder_id: folder.folderId,
      parent_folder_id: folder.parentFolderId,
      folder_name: folder.name,
      created_time: folder.createdTime,
      last_modified_time: folder.lastModifiedTime,
      creator_id: Number(folder.creatorId),
      file_count: await db.groupFiles.where({ groupId, parentFolderId: folder.folderId }).count(),
    })))
    return response({ files: files.filter(file => nonNullable(file)), folders })
  },
  move_group_file: async ({
    group_id,
    file_id,
    target_folder_id = '/',
  }: {
    group_id: number
    file_id: string
    target_folder_id?: string
  }) => {
    const groupId = group_id.toString()
    if (!(await db.groupFiles.get([groupId, file_id]))) {
      return failure(-404, `群文件 ${file_id} 不存在`)
    }
    if (!(await groupFolderExists(groupId, target_folder_id))) {
      return failure(-404, `群文件夹 ${target_folder_id} 不存在`)
    }
    await db.groupFiles.update([groupId, file_id], { parentFolderId: target_folder_id })
    return response()
  },
  rename_group_file: async ({
    group_id,
    file_id,
    new_file_name,
  }: {
    group_id: number
    file_id: string
    new_file_name: string
  }) => {
    const groupId = group_id.toString()
    if (!(await db.groupFiles.get([groupId, file_id]))) {
      return failure(-404, `群文件 ${file_id} 不存在`)
    }
    await db.files.update(file_id, { name: new_file_name })
    return response()
  },
  delete_group_file: async ({ group_id, file_id }: { group_id: number, file_id: string }) => {
    const key: [string, string] = [group_id.toString(), file_id]
    if (!(await db.groupFiles.get(key))) {
      return failure(-404, `群文件 ${file_id} 不存在`)
    }
    await db.groupFiles.delete(key)
    return response()
  },
  create_group_folder: async ({ group_id, folder_name }: { group_id: number, folder_name: string }) => {
    const groupId = group_id.toString()
    if (!(await canUseGroupFiles(groupId))) {
      return failure(-403, '机器人不是群成员')
    }
    const folderId = getUUID()
    const time = getTimestamp()
    await db.groupFolders.add({
      groupId,
      folderId,
      parentFolderId: '/',
      name: folder_name,
      createdTime: time,
      lastModifiedTime: time,
      creatorId: useStateStore().bot!.id,
    })
    return response({ folder_id: folderId })
  },
  rename_group_folder: async ({
    group_id,
    folder_id,
    new_folder_name,
  }: {
    group_id: number
    folder_id: string
    new_folder_name: string
  }) => {
    const key: [string, string] = [group_id.toString(), folder_id]
    if (!(await db.groupFolders.get(key))) {
      return failure(-404, `群文件夹 ${folder_id} 不存在`)
    }
    await db.groupFolders.update(key, { name: new_folder_name, lastModifiedTime: getTimestamp() })
    return response()
  },
  delete_group_folder: async ({ group_id, folder_id }: { group_id: number, folder_id: string }) => {
    const groupId = group_id.toString()
    const key: [string, string] = [groupId, folder_id]
    if (!(await db.groupFolders.get(key))) {
      return failure(-404, `群文件夹 ${folder_id} 不存在`)
    }
    await db.transaction('rw', db.groupFolders, db.groupFiles, async () => {
      await db.groupFiles.where({ groupId, parentFolderId: folder_id }).delete()
      await db.groupFolders.delete(key)
    })
    return response()
  },
}
