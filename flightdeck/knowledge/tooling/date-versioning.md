# Date versioning checklist
SUMMARY: Always store Matcha for Milky versions as MSI-compatible `YY.M.DDNN` SemVer and display them as `YYYYMMDDNN-dev` or `YYYYMMDDNN-build`.
READ WHEN: before changing the application version or creating any Matcha for Milky release tag.

---

Tauri requires a SemVer application version, and Windows MSI constrains the numeric version fields. A compact value such as `2025071802-dev` cannot be used directly as the package version.

Use this mapping:

- Internal package and updater version: `YY.M.DDNN`, such as `25.7.1802`.
- Development display: `YYYYMMDDNN-dev`, such as `2025071802-dev`.
- Release display: `YYYYMMDDNN-build`, such as `2025071802-build`.
- Release tag: `vYYYYMMDD.N`, such as `v20250718.2`.

`DDNN` combines the two-digit day and two-digit daily sequence. This keeps SemVer ordering chronological while staying within Windows installer limits. `src/utils/version.ts` owns the user-facing conversion.
