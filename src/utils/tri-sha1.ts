export async function calculateTriSha1(contents: Uint8Array): Promise<string> {
  const partSize = 10 * 1024 * 1024
  const sampleSize = Math.min(contents.length, partSize * 3)
  const sample = new Uint8Array(sampleSize + 8)

  if (contents.length <= sampleSize) {
    sample.set(contents)
  } else {
    sample.set(contents.subarray(0, partSize))
    const middleStart = Math.floor(contents.length / 2) - Math.floor(partSize / 2)
    sample.set(contents.subarray(middleStart, middleStart + partSize), partSize)
    sample.set(contents.subarray(contents.length - partSize), partSize * 2)
  }

  new DataView(sample.buffer).setBigUint64(sampleSize, BigInt(contents.length), true)
  const hash = await crypto.subtle.digest('SHA-1', sample)
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()
}
