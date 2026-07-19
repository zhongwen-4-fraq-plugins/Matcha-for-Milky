# Milky private file hash checklist
SUMMARY: Always calculate a private incoming file segment's `file_hash` as TriSHA1 from the cached bytes; never substitute the cache SHA-256, and omit it from group files.
READ WHEN: before changing any Milky file message segment or private `message_receive` event.

---

Milky 1.2.2 defines `file_hash` as an optional TriSHA1 string that exists only on private
incoming file segments. Matcha for Milky's cache key is SHA-256 and has different semantics,
so it must not be copied into this field.

Calculate TriSHA1 as follows:

1. For files up to 30 MiB, use the complete file as the sample.
2. For larger files, concatenate the first 10 MiB, a centered 10 MiB slice, and the last
   10 MiB.
3. Append the original file length as an eight-byte little-endian unsigned integer.
4. Return the SHA-1 digest of that sample as an uppercase hexadecimal string.

Enable this calculation only while building private incoming messages. The shared message
builder is also used for group events, where `file_hash` must remain absent.
