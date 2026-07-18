# GitHub issue closing keyword checklist
SUMMARY: Always read the issue content and history before choosing `Fixes` for a defect, `Resolves` for completed requested work, or `Closes` for a neutral administrative closure.
READ WHEN: before linking or closing any GitHub issue from a commit message or pull request.

---

GitHub supports `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves`, and `resolved`. They have the same automatic-closing behavior when the commit reaches the default branch or the pull request targeting the default branch is merged.

Choose the wording that describes the actual history:

- `Fixes #N`: existing behavior was broken and the change corrects the defect.
- `Resolves #N`: the issue requested new work, a feature, or a task and that work is now complete.
- `Closes #N`: neutral closure where neither "fix" nor "resolve" accurately describes the outcome.

Issue #2 used `Fixes #2` because Linux log copying and export were broken and the implementation directly corrected both behaviors.

Source: https://docs.github.com/zh/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
