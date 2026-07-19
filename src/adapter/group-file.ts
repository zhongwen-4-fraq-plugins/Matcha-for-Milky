export async function registerGroupFiles(
  groupId: string,
  uploaderId: string,
  fileIds: string[],
  parentFolderId = '/',
): Promise<void> {
  const uniqueFileIds = [...new Set(fileIds)]
  if (uniqueFileIds.length === 0) {
    return
  }
  const uploadedTime = getTimestamp()
  await Promise.all(uniqueFileIds.map(async fileId =>
    await db.groupFiles.put({
      groupId,
      fileId,
      parentFolderId,
      uploadedTime,
      uploaderId,
      downloadedTimes: 0,
    }),
  ))
}
