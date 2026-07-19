# Milky group file registration checklist
SUMMARY: Always register cached group-chat `file` segments in `groupFiles` before emitting their message event, and share that registration path with `upload_group_file`.
READ WHEN: before changing any group file message, upload, list, move, rename, delete, or download behavior.

---

A file attached in the group chat UI and a file uploaded through Milky's
`upload_group_file` API are two entry paths to the same simulated group-file state. Both
must write a `groupFiles` record keyed by `[groupId, fileId]` before consumers receive the
file ID.

The record carries the parent folder, upload time, uploader ID, and download count. The
underlying name, size, and cached bytes remain in `files` under `fileId`.

If the chat path only emits a `message_receive` file segment, the plugin receives a valid
`file_id` but `get_group_file_download_url` returns `群文件 <id> 不存在` and
`get_group_files` omits it. Keep both entry paths on one registration helper so their
compound keys and metadata cannot drift.
