import { formatDateVersion, formatReleaseVersion } from '~/utils/version'

import { isCI, isPR } from '~build/ci'
import { github, tag } from '~build/git'
import { isBuild, isRelease, prNum, buildSha } from '~build/meta'
import { version } from '~build/package'

interface Version {
  name: string
  link: string
}

export function getVersion(): Version {
  const displayVersion = formatDateVersion(version)

  if (import.meta.env.DEV) {
    return {
      name: `${displayVersion}-dev`,
      link: '',
    }
  }
  if (isCI) {
    if (isBuild) {
      const shortSha = buildSha.slice(0, 7)
      return isPR
        ? {
            name: `${displayVersion}-build.${shortSha} (pr#${prNum})`,
            link: `${github}/pull/${prNum}`,
          }
        : {
            name: `${displayVersion}-build.${shortSha}`,
            link: `${github}/commit/${buildSha}`,
          }
    }
    if (isRelease && tag) {
      return {
        name: formatReleaseVersion(version),
        link: `${github}/releases/tag/${tag}`,
      }
    }
  }
  return {
    name: `${displayVersion}-unknown`,
    link: '',
  }
}
