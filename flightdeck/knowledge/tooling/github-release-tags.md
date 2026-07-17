# GitHub release tag checklist
SUMMARY: Always make Tauri Action use the pushed date-sequence tag and grant `contents: write`; `v__VERSION__` targets the package version instead.
READ WHEN: before creating or changing any GitHub release tag for Matcha for Milky.

---

Matcha for Milky release tags use `vYYYYMMDD.N`, where `N` is the next unused sequence number for that date.

The release workflow is triggered by `v*` tags. Its Tauri Action `tagName` and `releaseName` must use `github.ref_name`, so a tag such as `v20260718.1` does not accidentally publish under the package-derived tag `v0.4.8`.

For a manual `workflow_dispatch`, supply the same tag format through the required `tag` input; the workflow uses that input before falling back to the pushed tag name.

GitHub supplies `secrets.GITHUB_TOKEN` automatically. The workflow must grant it `contents: write` to create the release and upload artifacts; no manually created `GITHUB_TOKEN` secret is needed.
