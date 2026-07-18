import { execFileSync } from 'node:child_process'

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function findPreviousTag(tag) {
  try {
    return execFileSync('git', ['describe', '--tags', '--abbrev=0', `${tag}^`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  }
  catch {
    return ''
  }
}

function readCommits(tag, previousTag) {
  let range = previousTag ? `${previousTag}..${tag}` : tag
  let output = runGit(['log', '--no-merges', '--format=%H%x09%s', range])

  if (!output) {
    return []
  }

  return output.split('\n').map((line) => {
    let separator = line.indexOf('\t')
    return {
      hash: line.slice(0, separator),
      subject: line.slice(separator + 1),
    }
  })
}

function getCategory(subject) {
  if (subject.startsWith('💥') || subject.includes('BREAKING CHANGE') || /^[a-z]+(?:\([^)]+\))?!:/i.test(subject)) {
    return '破坏性更新'
  }

  if (/^(✨|🎉|➕|🌟)/u.test(subject)) {
    return '新增'
  }

  if (/^(📝|💡|✏️)/u.test(subject)) {
    return '文档'
  }

  if (/^(♻️|🏗️|🚚|🔥|⚰️)/u.test(subject)) {
    return '重构'
  }

  return '修改'
}

function formatCommit(commit) {
  if (!process.env.GITHUB_REPOSITORY) {
    return `- ${commit.subject} (${commit.hash.slice(0, 7)})`
  }

  return `- ${commit.subject} ([${commit.hash.slice(0, 7)}](https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${commit.hash}))`
}

function generateReleaseNotes(tag) {
  let groups = new Map([
    ['新增', []],
    ['修改', []],
    ['文档', []],
    ['重构', []],
    ['破坏性更新', []],
  ])

  for (let commit of readCommits(tag, findPreviousTag(tag)))
    groups.get(getCategory(commit.subject)).push(commit)

  let sections = []
  for (let [category, commits] of groups) {
    if (commits.length > 0) {
      sections.push(`## ${category}\n\n${commits.map(formatCommit).join('\n')}`)
    }
  }

  return sections.join('\n\n') || '没有用户可见的更新。'
}

let tag = process.argv[2]
if (!tag) {
  throw new Error('请提供发布标签，例如 v20260719.1')
}

console.log(generateReleaseNotes(tag))
