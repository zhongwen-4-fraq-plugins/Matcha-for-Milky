export function toMilkyId(value: string | number): number {
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new TypeError(`Milky ID 必须是正整数，当前值为 ${String(value)}`)
  }
  return id
}
