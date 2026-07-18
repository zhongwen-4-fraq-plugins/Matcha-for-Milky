export function formatDateVersion(version: string) {
  const match = /^(\d{2})\.(\d{1,2})\.(\d{4})$/.exec(version)
  if (!match) {
    return version
  }

  const [, year, month, dayAndSequence] = match
  return `20${year}${month.padStart(2, '0')}${dayAndSequence}`
}

export function formatReleaseVersion(version: string) {
  const formatted = formatDateVersion(version)
  return formatted === version ? version : `${formatted}-build`
}
