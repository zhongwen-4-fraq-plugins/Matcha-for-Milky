# Local release EXE checklist
SUMMARY: Always set `GITHUB_WORKFLOW=Release` when building the Windows EXE delivered to Downloads so update checking is compiled in.
READ WHEN: before building any local Windows EXE for user delivery.

---

`vite.config.ts` sets `isRelease` only when `GITHUB_WORKFLOW` equals `Release`. A normal `tauri build` still produces a valid executable, but it hides the manual update menu and automatic-update setting and skips the startup update check.

Build the standalone release-mode executable in PowerShell with:

```powershell
$env:GITHUB_WORKFLOW = 'Release'
bun run tauri build --no-bundle
```

Verify the generated `dist/assets/meta-*.js` exports the release flag as `true`, then copy `src-tauri/target/release/mfm.exe` to `~/Downloads/Matcha for Milky.exe` and compare SHA-256 hashes.
