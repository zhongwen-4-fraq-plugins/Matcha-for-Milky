# ⚠ Release Drafter ignores direct commits
SUMMARY: Release Drafter builds changelogs from merged pull requests, so direct commits to the default branch produce no release notes even when the tags contain different commits.
READ WHEN: when a GitHub Release has empty notes or says `No changes` despite commits existing between release tags.

---

Release Drafter uses merged pull requests, their labels, titles, numbers, and authors to fill `$CHANGES`. It does not turn ordinary Git commits into changelog entries.

For Matcha for Milky, `v20260718.4..v20260719.1` contains 11 first-parent commits and no merge commits. The changelog job therefore succeeds technically while producing no useful changes. A successful Action status only means Release Drafter ran without an API error.

The release workflow also lets Release Drafter create or update a draft while each parallel Tauri Action job manages a tagged draft. Keep one component responsible for creating the Release, generate notes from Git commits when direct commits are the normal workflow, and let platform jobs only upload assets to that Release.

Matcha for Milky now generates notes with `scripts/generateReleaseNotes.js`. It compares the current tag with its nearest previous tag and groups non-merge commits into 新增、修改、文档、重构、破坏性更新. The changelog job creates or updates one tagged draft before the platform matrix starts, so Tauri Action only uploads assets to an existing Release.
