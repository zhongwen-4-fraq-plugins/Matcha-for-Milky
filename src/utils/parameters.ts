import type { ParameterEntry } from '~/types/parameter'

function getParameterValue(value: string): unknown {
  if (!value.trim()) {
    return ''
  }
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

export function buildParameterRecord(parameters: ParameterEntry[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const parameter of parameters) {
    const name = parameter.name.trim()
    if (!name) {
      continue
    }
    if (Object.hasOwn(result, name)) {
      throw new TypeError(`参数 ${name} 重复`)
    }
    result[name] = getParameterValue(parameter.value)
  }
  return result
}
